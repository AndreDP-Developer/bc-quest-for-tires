# Reference and direction

Owner's correction: preserve the original C64 characters and animation, with at most slight smoothing. The first prototype's character redesigns, static poses and invented music were rejected.

- Owner's video: https://www.youtube.com/watch?v=xu2c6-Oa6dY
- Original program source: https://c64.krissz.hu/quest-for-tires/play-online/
- Control reference: https://www.c64-wiki.com/wiki/BC%27s_Quest_for_Tires

The revised build executes the original program for its poses, scenery, scrolling, slope behavior, collisions, course transitions and sound commands. Three.js applies optional contour smoothing to the game field, while the HUD remains unfiltered. Frame timing stays at 50 Hz; no invented in-between poses or replacement tune are added.

Checkpoint creation: decompress the page's LZW/base64 PRG payload, boot it in the research C64 runtime, press F1, release it, then save the normal single-player state. Research boot ROMs and downloaded source pages are excluded from the repository. The shipped compatibility shim handles interrupt dispatch/return; browser controls provide start/pause/restart.
