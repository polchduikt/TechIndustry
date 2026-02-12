const hbs = require('hbs');

hbs.registerHelper('avatarWithFrame', function(avatarData, frame, username) {
    const initials = username ? username.substring(0, 2).toUpperCase() : '??';
    let frameClass = '';
    if (frame) {
        frameClass = `frame-${frame}`;
    }
    const avatarContent = avatarData
        ? `<img src="${avatarData}" alt="${username}">`
        : `<span>${initials}</span>`;

    return new hbs.SafeString(`
        <div class="avatar-with-frame ${frameClass}">
            ${avatarContent}
        </div>
    `);
});

const frameStyles = `
.avatar-with-frame {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
}

.avatar-with-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-with-frame span {
    font-size: inherit;
    font-weight: 700;
    color: white;
}

/* Frames */
.avatar-with-frame.frame-silver::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    padding: 4px;
    background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    z-index: -1;
}

.avatar-with-frame.frame-gold::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    padding: 4px;
    background: linear-gradient(135deg, #FFD700, #FFA500);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    z-index: -1;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
}

.avatar-with-frame.frame-neon::before {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    padding: 5px;
    background: linear-gradient(135deg, #0ff, #f0f);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    z-index: -1;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    animation: neonPulse 2s ease-in-out infinite;
}

.avatar-with-frame.frame-fire::before {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    padding: 5px;
    background: linear-gradient(135deg, #ff4500, #ff8c00);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    z-index: -1;
    box-shadow: 0 0 25px rgba(255, 69, 0, 0.6);
    animation: fireFlicker 1.5s ease-in-out infinite;
}

.avatar-with-frame.frame-diamond::before {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    padding: 6px;
    background: linear-gradient(135deg, #b9f2ff, #4fc3f7);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    z-index: -1;
    box-shadow: 0 0 30px rgba(79, 195, 247, 0.7);
    animation: diamondSparkle 3s ease-in-out infinite;
}

@keyframes neonPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

@keyframes fireFlicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
}

@keyframes diamondSparkle {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.2); }
}
`;

module.exports = { frameStyles };