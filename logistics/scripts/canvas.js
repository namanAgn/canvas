export const canvas = document.getElementById("c");
export const ctx = canvas.getContext("2d");

export const camera = { x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 1, min: 0.2, max: 5 };