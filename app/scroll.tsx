import React, { useRef, useEffect } from 'react';
import Scrollbar from 'smooth-scrollbar';

const SmoothScrollContainer = ({ children }) => {
    const scrollRef = useRef<HTMLDivElement>(null);  // Specify HTMLDivElement to type the ref.

    useEffect(() => {
        if (scrollRef.current) {
            const scrollbar = Scrollbar.init(scrollRef.current, {
                damping: 0.07,  // Adjust the damping (friction) for the scrolling
                renderByPixels: true, // Enable more precise pixel rendering
                continuousScrolling: true, // Enable or disable the ability to scroll continuously
            });

            return () => scrollbar.destroy();
        }
    }, []);

    return (
        <div ref={scrollRef} style={{ height: '100vh', overflow: 'hidden' }}>
            {children}
        </div>
    );
};

export default SmoothScrollContainer;
