'use client';

import React, { useRef, useEffect } from 'react';

const SmoothScrollContainer = ({ children }) => {
    return (
        <div style={{ height: '100vh', overflow: 'auto', scrollBehavior: 'smooth' }}>
            {children}
        </div>
    );
};

export default SmoothScrollContainer;