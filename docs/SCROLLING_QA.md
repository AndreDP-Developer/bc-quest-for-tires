# Scrolling verification - v0.2.4

23 September 2026. All work was silent: Node frame runs had no audio output, and browser playback was muted.

## Cause and correction

At fast speed the woodland canopy previously jumped about 9 pixels forward and 4 pixels backward as its coarse character rows and fine-scroll offset came from different updates. The VIC presentation now holds the previous four character rows during the original copy routine (write at $76EF, post-write PC $76F2) until its fine-scroll commit to $4002. The game continues executing against unmodified RAM.

A 1,000-frame regression verifies that every interior canopy pixel matches a forward translation of the previous frame. It also verifies the earlier black-dash fix. Original input, audio, pause, death/re-entry and restart tests remain green (11 tests).

## Assisted full-route inspection

Traversed the complete original route through all 15 segments and reached the rescue: open ground, two woodland segments, first turtle crossing, uphill segments, cliff/bird section, descent, second crossing approach, bird section, dinosaur crossing, two cave segments, and rescue. Recorded multiple frames per section and inspected the resulting contact sheets.

For coverage, the research-only harness supplied extra lives, bypassed the obstacle collision routine and advanced section progress at gates. These changes exist only in ignored research scripts/checkpoints, not in the shipped game. This was a visual audit, not an unassisted successful playthrough or a difficulty/balance assessment.

Compared 180 consecutive frames in each of the 15 section checkpoints at several scenery rows. No exact backward scenery translations were found. Woodland and cave samples had no mismatched translations. Inspected flagged differences elsewhere in before/after pairs: they corresponded to Thor jumping, the moving bird or the rescue heart crossing the sampled rows, rather than scenery flashes.

Reviewed normal death/re-entry and restart via the regression suite. This is evidence for the sampled route and speeds, not a guarantee against every possible rendering issue on every browser or display. The presentation retains the original 50 Hz pixel animation cadence.
