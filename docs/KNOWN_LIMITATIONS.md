# Known limitations

1. Every unit has two worked examples and at least three practice questions, but the target practice breadth remains up to five questions per unit.
2. The 89-definition audit covers concepts and explicitly defined terminology used by the 11 course review units. Exercise-local temporary definitions and application vocabulary outside the unit map are recorded in `DEFINITION_AUDIT.md` rather than silently treated as course definitions.
3. Handwritten matrices and diagrams extract imperfectly. Four representative review pages and 45 textbook pages were manually checked; a page-by-page review of every exercise remains.
4. Generated questions include two items marked `requires-human-review`; the rest are source-verified or deterministically checked at the stated level.
5. The live exam timer intentionally does not auto-submit at zero; the learner must submit manually, which avoids losing unfinished local work.
6. Search uses substring matching plus notation normalization and a small semantic alias set. It does not yet provide stemming, fuzzy matching, or ranked relevance.
7. No service worker is installed. The built application is fully local once served, but browser refresh still requires the local Vite/static server.
8. A few long display equations use a contained horizontal scroller on narrow phones.
