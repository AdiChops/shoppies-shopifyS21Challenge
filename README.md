# UX Developer Intern & Web Developer Intern Challenge - Summer 2021
## The Shoppies: Movie awards for entrepreneurs
A webpage that uses the [OMDB API](http://www.omdbapi.com) to search movies that can be added to the user's nominations.
### The Code
The webpage uses vanilla JavaScript with some jQuery and Bootstrap (only for the modal popup and search bar).
The nominations get saved to `localStorage`, so they are stored when the user leaves that page and they can be viewed again when the user comes back to the page.
The API call is made with `fetch`.

Since search results can have different pages and there are 10 results per page, there is a division that happens with the number of results to determine the number of pages.
