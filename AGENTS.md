<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All app data is synthetic mock data in src/data/districts.ts; no backend yet (v1 is a frontend prototype).
- Leaflet map is lazy-loaded behind ClientOnly (src/components/oh/LazyMap.tsx) because Leaflet breaks SSR.
