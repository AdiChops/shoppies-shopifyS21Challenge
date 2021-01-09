let $$ = (id) => { return document.getElementById(id);};
const MAX_NOMINEES = 5;

// populating the nominees in localStorage once the page loads
addEventListener('load', ()=>{
    populateNominees();
});

$$("searchTitle").addEventListener('keyup', async ()=>{
    let searchText = $$("searchTitle").value;
    if(searchText == ""){
        $$("pageSelection").style.display = "none";
        $$("resultsHeader").textContent = "";
        $$("results").innerHTML = "";
        $$("resultsDiv").style.display = "none";
    }
    else{
        $$("resultsHeader").textContent = `Results for "${searchText}"`;
        // perform API call
        let numResults = await performSearch(searchText, 1);
        let pagesOptions = new Array(Math.ceil(numResults/10)+1);
        pagesOptions.pop(); // getting rid of page 0
        $$("pages").options = pagesOptions;
        $$("pages").style.display = "block";
        $$("resultsDiv").style.display = "block";
    }
});

/**
 * This function performs the search for the user.
 * @param {*} searchText represents what the user types into the search field
 * @param {*} p represents the page of results that the user would like to view
 */
let performSearch = async (searchText, p) => {
    let num = 0;
    // calling the API
    await fetch(`https://omdbapi.com/?apikey=bf80773c&s=${searchText}&page=${p}`).then((resp) => {
        return resp.json();
    }).then((info)=>{
        if(info["Response"] == "False"){
            $$("results").textContent = info["Error"];
            $$("pages").style.display = "none";
        } // if invalid call
        else{
            let films = info["Search"];
            let results = "<ul>";
            for(let i in films){
                let film = films[i];
                results += `<li>${film["Title"]} (${film["Year"]}) <button class="btn btn-outline-success btn-sm" title="Nominate" name="nominate" ${disableButton(film["imdbID"])} value="${i}" id="${film["imdbID"]}"}><i class="fas fa-check"></i></button></li>`;
            }
            results+="</ul>"
            $$("results").innerHTML = results;
            num = parseInt(info["totalResults"]);
            let nominates = document.getElementsByName("nominate");
            for(let n of nominates){
                n.addEventListener('click', ()=>{
                    let val = films[n.value];
                    if($$("nominations").innerHTML.trim() == "<p>No nominations yet!</p>"){
                        $$("nominations").innerHTML = "";
                    }
                    localStorage.setItem(val["imdbID"], encodeURIComponent(JSON.stringify(val)));
                    addNominee(val);
                    n.disabled = true;
                });
            }
        }
    });
    
    return num;
};

/**
 * This functions returns whether a "nominate" button should be disabled, depending on if the movie is already nominated,
 * or if the maximum number of nominations is reached.
 * @param {*} movieId represents the imdbID of the movie, which represents the "nominate" button for that movie
 */
let disableButton = (movieId) =>{
    return (localStorage.getItem(movieId) != null || nominationsIsFull())? "disabled":"";
};

/**
 * This function disables all of the "nominate" buttons
 */
let disableAll = () =>{
    let buttons = document.getElementsByName("nominate");
    for(let button of buttons){
        button.disabled = true;
    }
};

/**
 * This function determines if the maximum number of nominations is reached.
 */
let nominationsIsFull = () =>{
    return Object.keys(localStorage).length >= MAX_NOMINEES;
};

/**
 * This function is called when the page is first loaded. It populates the nominations div with all
 * of the nominations that are still stored in localStorage.
 */
let populateNominees = () => {
    let keys = Object.keys(localStorage);
    if(keys.length != 0){
        $$("nominations").innerHTML = "";
    }
    for(let key of keys){
        addNominee(JSON.parse(decodeURIComponent(localStorage.getItem(key))));
    }
};

/**
 * This function nominates a movie (adding it to local storage and to the nominations div) 
 * and displays the modal/badge if the max numbe of nominations is reached
 * @param {*} item represents the movie getting nominated
 */
let addNominee = (item) => {
    $$("nominations").insertAdjacentHTML( 'beforeend', `<p id="nom${item["imdbID"]}">${item["Title"]} (${item["Year"]}) <button class="btn btn-outline-danger btn-sm" title="Remove nomination" id="rem${item["imdbID"]}"><i class="fas fa-times"></i></button></p>`);
    $$(`rem${item["imdbID"]}`).addEventListener('click', () => {removeNominee(item["imdbID"])});
    // Checking if more nominations can be displayed
    if(nominationsIsFull()){
        $("#nomFullModal").modal(); //displaying modal
        disableAll(); // disabling all "nominate" buttons
        $$("maxNoms").textContent = `${MAX_NOMINEES} nominations reached!`; // displaying badge
    }
};

/**
 * This function enables all of the "nominate" buttons (except the movies already nominated)
 */
let reEnableAll = () =>{
    let buttons = document.getElementsByName("nominate");
    for(let button of buttons){
        if(localStorage.getItem(button.id) == null){
            button.disabled = false;
        }
    }
};

/**
 * This functions removes a nominations from the nominee list (from the div and from localStorage)
 * @param {*} id represents the imdbID of the movie getting removed from nominations
 */
let removeNominee = (id) => {
    localStorage.removeItem(id);
    let nominateBtn = $$(id);
    let par = $$(`nom${id}`);
    par.parentNode.removeChild(par);
    if(nominateBtn != undefined){
        nominateBtn.disabled = false;
    }
    // since the number of nominations is not at the maximum anymore, reEnableAll() is called
    reEnableAll();
    let keys = Object.keys(localStorage);
    if(keys.length == 0){
        $$("nominations").innerHTML = "<p>No nominations yet!</p>"
    }
    $$("maxNoms").textContent = ``;
};