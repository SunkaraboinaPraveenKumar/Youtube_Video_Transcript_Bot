"use client";
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

function WebSearch({ setWebSearchActive }) {
  const [active, setActive] = useState(false);

  const toggleWebSearch = () => {
    setActive(prevActive => !prevActive);
  };

  // Notify parent of the active state change after it has been updated
  useEffect(() => {
    setWebSearchActive(active);
  }, [active, setWebSearchActive]);

  return (
    <div onClick={toggleWebSearch} className="cursor-pointer">
      <Image
        src='/web.png'
        height={40}
        width={40}
        alt="web"
        className={`rounded-md ${active ? 'filter brightness-125' : 'filter invert'}`}
      />
    </div>
  );
}

export default WebSearch;
