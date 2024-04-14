'use client';

import React, { useRef, useEffect } from 'react';

{/*
This implementation and basic implementations for smooth-scrollbar as I understood them are broken for iOS.
What ends up happening is scrolling requires two interactions to scroll all the way down or up.
It works flawlessly on desktop, but I'm not sure how to fix it for iOS.
The whole idea is to bring about luxurious scrolling, but it's not working as intended.
*/}

const SmoothScrollContainer = ({ children }) => {
    return (
        <div style={{ height: '100vh', overflow: 'auto', scrollBehavior: 'smooth' }}>
            {children}
        </div>
    );
};

export default SmoothScrollContainer;