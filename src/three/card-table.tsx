import React from "react";
import * as THREE from "three";
import { Canvas, GroupProps, ThreeEvent, useFrame } from "@react-three/fiber";
import {
    animated,
    useSprings,
} from "@react-spring/three";
import create from "zustand";
import { useGesture } from "@use-gesture/react";
import { useControls } from "leva";
import { useInView } from 'react-intersection-observer';

import Card, { Suspended } from 'three/card';
import { cardMovementSpringConf, cardSpringConf } from 'three/primitives/springs';
import { useCardBacks, useCardBorders } from 'three/primitives/textures';
import { CardBackInk, CardBorderInk } from './legend-preview';
import { Atmosphere, Sun } from './primitives/lights';

//////////////////////////////////////////////////////////////
// Types and a data store for card state                    //
//////////////////////////////////////////////////////////////

// A react ref for tracking mouse position
interface MouseRef {
    position: {
        x: number;
        y: number;
    };
    hoverPosition: {
        x: number;
        y: number;
    };
    object?: THREE.Object3D;
}

// A react ref for tracking dragging of an object
interface DragRef {
    x: number;
    y: number;
    vX: number; // velocity in px / ms
    vY: number; // velocity in px / ms
    dX: number; // direction
    dY: number; // direction
    i?: number;
    dragging: boolean;
    dragged: boolean;
    object?: THREE.Object3D;
}

// A react ref for tracking animation clock
export interface ClockRef {
    tick: number;        // Counter for number of ticks
    lastTick: number;    // Timestamp of previous tick
    tps: number;         // Ticks per second
    elapsed: number;     // Time elapsed
    prevElapsed: number; // Timestamp of previous frame
    animOffset: number;  // Time spent hover, for smooth pausing
    slowFrames: number;  // Number of frames in a row that have been slow to render
}

interface CardType {
    flip: boolean;
    lift?: number;
}

interface Store {
    cards: CardType[];
    setCards: (i: number) => void;
    focus: number;
    flip: (i: number) => void;
    setFocus: (i: number) => void;
    bump: (i: number) => void;
}

// A zustand store
const useStore = create<Store>((set) => ({
    cards: [],
    focus: 0,
    setCards: (i: number) => {
        set((state) => {
            state.setFocus(0);
            return {
                // @ts-ignore: animated props...
                cards: Array.apply(null, { length: i }).map(() => ({ flip: false }))
            };
        });
    },
    setFocus: (i: number) => set(() => ({ focus: i })),
    flip: (i: number) =>
        set((state) => {
            state.bump(i);
            const cards = state.cards;
            cards[i].flip = !cards[i].flip;
            return { cards };
        }),
    bump: (i: number) => {
        set((state) => {
            const cards = state.cards;
            cards[i].lift = 4.5;
        });
        setTimeout(
            () =>
                set((state) => {
                    const cards = state.cards;
                    cards[i].lift = 0;
                }),
            100
        );
    }
}));

////////////////////////////////////////////////////////////////
// Some configuration and utils                               //
////////////////////////////////////////////////////////////////

const defaultCardCount = 4;

// Get the nth decimal from a float
function nthDigit(ntn: number, number: number) {
    // var len = Math.floor(Math.log(number) / Math.LN10) - ntn;
    // return (number / Math.pow(10, len)) % 10 | 0;
    // Note: this could probably be more efficient
    return Number(number.toString().split(".")[1][ntn]);
}

// Augment rotation based on mouse position
const hoverBox = new THREE.Box3();
function hoverTilt(baseRotation: [number, number, number], mouse: MouseRef) {
    if (!mouse.object) return baseRotation;
    hoverBox.setFromObject(mouse.object);
    const mX =
        mouse.hoverPosition.x >= 0
            ? mouse.hoverPosition.x / hoverBox.max.x
            : -mouse.hoverPosition.x / hoverBox.min.x;
    const mY =
        mouse.hoverPosition.y >= 0
            ? mouse.hoverPosition.y / hoverBox.max.y
            : -mouse.hoverPosition.y / hoverBox.min.y;
    return [
        baseRotation[0] + mY * THREE.MathUtils.degToRad(5),
        baseRotation[1] + -mX * THREE.MathUtils.degToRad(10),
        baseRotation[2],
        "ZXY"
    ];
}

// Augment rotation based on drag velocity
function dragTilt(
    baseRotation: [number, number, number],
    drag: DragRef,
    factor = 1,
    rangeFactor = 1
) {
    const { vX, vY, dX, dY } = drag;
    return [
        THREE.MathUtils.clamp(
            baseRotation[0] + vY * dY * factor,
            -0.25 * rangeFactor,
            0.25 * rangeFactor
        ),
        THREE.MathUtils.clamp(
            baseRotation[1] + (vX * dX * factor),
            (-0.25 + baseRotation[1]) * rangeFactor,
            (0.25 + baseRotation[1]) * rangeFactor
        ),
        baseRotation[2]
    ];
}

// Layout parameters for the focused card
function focusCardLayout (
    focus: number,
    cards: CardType[],
    cycle: number,
    clock: ClockRef,
    hover: boolean[],
) {
    return {
        scale: [0.75, 0.75, 0.75],
        position: [
            cycle * 1,
            1 + Math.sin(clock.elapsed * 2) * 0.025,
            0.2 + Math.abs(cycle * 0.25)
        ] as [number, number, number],
        rotation: [
            0,
            (cards[focus]?.flip ? -Math.PI : 0) + (hover[focus] ? 0 : cycle * -Math.PI * 0.05),
            0
        ] as [number, number, number],
    }
};

// Math to layout the other cards
function cardsLayout(
    i: number,
    focus: number,
    cards: CardType[],
    hover: boolean[],
    mouse: MouseRef
) {
    const num = cards.length - 1;
    const height = num * 0.05;
    const width = num * 0.6;
    const tilt = num * 0.005;
    const j = i > focus ? i - 1 : i;
    const phase = num === 1 ? 0 : j / (num - 1) - 0.5;
    const rotation = [0, -Math.PI, phase * Math.PI * tilt] as [number, number, number];

    return {
        scale: [0.4, 0.4, 0.4],
        position: [
            phase * width,
            -2.25 - Math.abs(phase * height) + (hover[i] ? 0.1 : 0),
            phase * 0.1,
        ],
        rotation: rotation,
        config: cardMovementSpringConf
    };
}

////////////////////////////////////////////////////////////////
// Tarot card mesh things                                     //
////////////////////////////////////////////////////////////////

// Adds flip and lift interactions to the basic tarot card mesh

interface CardProps extends GroupProps {
    flip?: boolean;
    lift?: number;
    i?: number;
}

function PreviewCard (props : CardProps) {
    const backs = useCardBacks();
    const borders = useCardBorders();
    return <Card {...props}>
        <CardBorderInk texture={borders.reverse()[Math.min(props.i || 0, borders.length - 1)]} />
        <CardBackInk texture={backs.reverse()[Math.min(props.i || 0, backs.length - 1)]} />
    </Card>;
}

// A surface to go under our cards
function Table(props: GroupProps) {
    return (
        <group {...props}>
            <mesh rotation={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 10]} />
                <meshStandardMaterial color={"#333"} />
            </mesh>
        </group>
    );
}

//////////////////////////////////////////////////////////////////////
// The primary scene!                                               //
//////////////////////////////////////////////////////////////////////

function Scene({ inView = true }) {
    // Scene state
    const { cards, setCards, focus, flip, setFocus } = useStore();
    const [hover, setHover] = React.useState<boolean[]>(Array(cards.length));

    // Rebuild hover state when cards array changes
    React.useEffect(() => setHover(Array(cards.length)), [cards]);

    // Clock for frame by frame animation
    const clock = React.useRef<ClockRef>({
        tick: 0,
        lastTick: 0,
        tps: 10,
        elapsed: 0,
        prevElapsed: 0,
        animOffset: 0,
        slowFrames: 0,
    });

    // Other references
    const scene = React.useRef<THREE.Scene>();
    const mouse = React.useRef<MouseRef>({
        hoverPosition: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
        object: undefined
    });
    const drag = React.useRef<DragRef>({
        x: 0,
        y: 0,
        vX: 0,
        vY: 0,
        dX: 0,
        dY: 0,
        object: undefined,
        dragging: false,
        dragged: false
    });

    // Debug UI
    const [{ tps, debugOnFrame, cardCount }, setConf] = useControls('Canvas #2', () => ({
        tps: clock.current.tps,
        cardCount: {
            value: defaultCardCount,
            step: 1,
            min: 1,
            max: 10
        },
        debugOnFrame: false,
        renderCalls: {
            value: 0,
            hint: '# of render calls per frame for second canvas',
            label: '# Calls',
            disabled: true,
        },
        triangles: {
            value: 0,
            hint: '# of triangles in second canvas',
            label: '# Triangles',
            disabled: true,
        },
        performance: {
            value: 0,
            label: 'Perf',
            disabled: true,
        },
        inView: {
            value: false,
            hint: 'is the second canvas in view',
            label: 'In View',
            disabled: true,
        },
        fps: {
            value: 0,
            label: 'FPS',
            disabled: true,
        },
    }));

    // Set number of cards based on debug UI input
    React.useEffect(() => setCards(cardCount), [cardCount]);

    // Update inView in debug UI
    React.useEffect(() => setConf({ inView, }), [inView]);

    const focusCardProps = React.useRef(focusCardLayout(focus, cards, 0, clock.current, hover));

    // Initialize spring animation interpolators with initial layouts
    const [springs, springApi] = useSprings(cards.length, (i) => {
        if (i === focus) return focusCardProps;
        else return cardsLayout(i, focus, cards, hover, mouse.current);
    });

    // It's weird, but the animation doesn't start automatically. This is just a kick.
    // It still doesn't work when the canvas is on screen during page load...
    React.useEffect(() => {
        setTimeout(() => {
            springApi.start((i) => i === focus ? {...focusCardProps.current, config: cardSpringConf} : {config: cardSpringConf});
        }, 100)
    }, [focus]);

    ////////////////////////////////////////////////////////////////////
    // The main animation loop                                        //
    ////////////////////////////////////////////////////////////////////

    useFrame((state) => {

        // Update the clock
        const t = state.clock.getElapsedTime();
        const c = clock.current;
        let render = false;
        c.prevElapsed = c.elapsed;
        c.elapsed = t;
        c.tps = tps;

        // Count clock ticks
        if (t - c.lastTick > 1 / c.tps) {
            render = true;
            c.lastTick = t;
            c.tick++;
        }

        // Track FPS
        if (inView && document.hasFocus()) setConf({ fps: Math.floor(1 / (c.elapsed - c.prevElapsed)), })

        // Pause primary animation loop on interactions or when out of view
        if (!inView || !document.hasFocus() || focus === drag.current.i || hover[focus]) {
            // Offset the animation if paused
            c.animOffset += c.elapsed - c.prevElapsed;
            // If out-of-view, do not render
            if (!inView || !document.hasFocus()) return null;
        };

        // Store a ref to the scene
        if (!scene.current) scene.current = state.scene;

        // Put render stats into the debug UI
        setConf({
            renderCalls: state.gl.info.render.calls,
            triangles: state.gl.info.render.triangles,
            performance: state.performance.current,
        });

        // Update mouse position
        mouse.current.position.x = state.mouse.x;
        mouse.current.position.y = state.mouse.y;

        // Make an object being dragged follow the mouse
        if (drag.current.dragging) {
            springApi.start((i) => {
                if (i === drag.current.i) {
                    return {
                        position: [
                            (state.mouse.x * state.viewport.width) / 3,
                            (state.mouse.y * state.viewport.height) / 3,
                            1
                        ],
                        rotation: dragTilt((i === focus ? focusCardProps.current.rotation : cardsLayout(i, focus, cards, hover, mouse.current).rotation), drag.current),
                        config: cardMovementSpringConf
                    };
                }
            });
        }

        // Apply interactivity (hover tilt) to focus card
        else if (hover[focus]) {
            springApi.start((i) => {
                if (i === focus) {
                    return {
                        config: cardSpringConf,
                        rotation: hoverTilt(focusCardProps.current.rotation, mouse.current),
                        scale: [0.85, 0.85, 0.85]
                    };
                } else {
                    return cardsLayout(i, focus, cards, hover, mouse.current);
                }
            });
        }

        // Limit mesh/spring updates based on ticks per second
        if (!render) return;

        // A constant to enable an animation cycle based on the sine of elapsed time
        const speed = 0.33;
        const cycle = Math.sin((c.elapsed - c.animOffset) * speed);

        // Update focus card properties
        focusCardProps.current = focusCardLayout(focus, cards, cycle, clock.current, hover);

        // Play the focus card animation loop
        if (!hover[focus] && drag.current?.i !== focus) {
            // Animate the focus card to its new position
            springApi.start((i) => i === focus ? {...focusCardProps.current, config: cardSpringConf} : {config: cardSpringConf});

            // Trigger a card flip at a certain point in the cycle
            // I.e. when moving from the 90% cycle frame to the 91% cycle frame
            if (c.elapsed > 5 && cycle > 0 && nthDigit(0, cycle) === 9) {
                const prevCycle = Math.sin((c.prevElapsed - c.animOffset) * speed);
                if (nthDigit(1, cycle) === 1 && nthDigit(1, prevCycle) === 0) {
                    flip(focus);
                }
            }
        }

        // Animate the other cards to their position in the layout
        if (!drag.current.dragging) {
            springApi.start((i) => {
                if (i === focus) return;
                if (drag.current.dragging && drag.current.i === i) return;
                return cardsLayout(i, focus, cards, hover, mouse.current);
            });
        }

        // Debug on next frame
        if (debugOnFrame) {
            setConf({ debugOnFrame: false });
            debugger;
        }
    });

    ///////////////////////////////////
    // UI Events                     //
    ///////////////////////////////////

    // We use useGesture to handle most (but not all) of the user input events
    const bindGestures = useGesture(
        {
            // Capture mouse pos and velocity while dragging
            onDrag: ({
                args: [i],
                velocity: [vX, vY],
                direction: [dX, dY],
                event
            }) => {
                const e = (event as unknown) as ThreeEvent<MouseEvent>;
                event.stopPropagation();
                // Updating drag target here would "hot swap" drag objects
                // drag.current.i = i;
                drag.current.x = e.point.x; // threejs units
                drag.current.y = e.point.y; // threejs units
                drag.current.vX = vX; // px / ms
                drag.current.vY = vY; // px / ms
                drag.current.dX = dX;
                drag.current.dY = dY;
            },
            // Track an object being dragged
            onDragStart({ args: [i] }) {
                drag.current.i = i;
                drag.current.dragging = true;
                drag.current.dragged = true;
            },
            // Track an object being dropped
            onDragEnd({ args: [i] }) {
                // Let the user change the focus by dropping a card on the table
                if (drag.current.i !== undefined && mouse.current.position.y > -0.3)
                    setFocus(drag.current.i);
                drag.current.dragging = false;
                drag.current.i = undefined;
            },
            // Track mouse pos while hovering an object
            onMove({ event }) {
                const e = (event as unknown) as ThreeEvent<MouseEvent>;
                mouse.current.hoverPosition.x = e.point.x;
                mouse.current.hoverPosition.y = e.point.y;
                mouse.current.object = e.eventObject;
            }
        },
        {
            drag: {
                threshold: [10, 10],
                pointer: {
                    touch: true
                }
            }
        }
    );

    // useGesture doesn't cover everything we need, so we have some handlers in react
    const bindReactGestures = (i: number) => ({
        // Change or flip focus on click
        onClick: (e: MouseEvent) => {
            e.stopPropagation(); // Prevent events on more than one mesh
            // Don't trigger the click handler after a drag event
            if (drag.current.dragged) {
                drag.current.dragged = false;
                return;
            }
            // Flip the focus card on click
            if (focus === i) {
                flip(focus);
            }
            // Set focus on a card on click
            else {
                setFocus(i);
            }
            // Clear hover states on click
            setHover(hover.map((x) => false));
        },
        // Track hover states
        onPointerOver: (e: MouseEvent) => {
            e.stopPropagation(); // Prevent events on more than one mesh
            const n = [...hover.map((x) => false)];
            n.splice(i, 1, true);
            setHover(n);
        },
        // Track hover states
        onPointerOut: (e: MouseEvent) => {
            e.stopPropagation(); // Prevent events on more than one mesh
            const n = [...hover];
            n.splice(i, 1, false);
            setHover(n);
        }
    });

    return (
        <group name="preview">
            <group name="preview-cards" position={[0, 0, 0.1]}>
                {cards.map((card, i) => {
                    const springProps = springs[i];
                    return (
                        // @ts-ignore
                        <animated.group
                            {...bindGestures(i)}
                            {...bindReactGestures(i)}
                            key={`card${i}`}
                            name={`card${i}`}
                        >
                            {/* TODO: I broke flip and lift animations :( */}
                            {/* @ts-ignore */}
                            <Suspended><PreviewCard i={i} flip={card.flip} lift={card.lift} {...springProps} /></Suspended>
                        </animated.group>
                    );
                })}
            </group>
            {/* <Table position={[0, 0, 0]} receiveShadow /> */}
            {/* <directionalLight
                intensity={0.25}
                position={[0, 1, 3]}
                castShadow
                shadow-mapSize-height={2048}
                shadow-mapSize-width={2048}
                shadow-camera-far={10}
                shadow-camera-near={0}
                shadow-camera-bottom={-5}
                shadow-camera-top={5}
                shadow-camera-right={5}
                shadow-camera-left={-5}
            />
            <ambientLight intensity={0.75} /> */}
            <Sun />
            <Atmosphere />
        </group>
    );
}

// Happy little root
export default function CardTableCanvas() {
    const { ref, inView } = useInView();
    return (
        <div ref={ref} className="canvasContainer" style={{width: '100%', height: '100%'}}>
            <Canvas
                camera={{ zoom: .75 }}
                shadows={{
                    enabled: false,
                    type: THREE.PCFSoftShadowMap
                }}
                dpr={window.devicePixelRatio}
            >
                <Scene inView={inView} />
            </Canvas>
        </div>
    );
}
