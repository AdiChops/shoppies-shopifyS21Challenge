let $$ = (id) => { return document.getElementById(id);};
const MAX_NOMINEES = 5;

addEventListener('load', ()=>{
    populateNominees();
});

$$("searchTitle").addEventListener('keyup', ()=>{
    let searchText = $$("searchTitle").value;
    if(searchText == ""){
        $$("pageSelection").style.display = "none";
        $$("resultsHeader").textContent = "";
        $$("results").innerHTML = "";
    }
    else{
        $$("resultsHeader").textContent = `Results for "${searchText}"`;
        // perform API call
        let numResults = performSearch(searchText, 1);
        console.log(numResults);
        let pagesOptions = new Array(Math.ceil(numResults/10)+1);
        pagesOptions.pop(); // getting rid of page 0
        $$("pages").options = pagesOptions;
        $$("pageSelestion").style.display = "block";
    }
});

let performSearch = (searchText, p) => {
    let num = 0;
    fetch(`https://omdbapi.com/?apikey=bf80773c&s=${searchText}&page=${p}`).then((resp) => {
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
                results += `<li>${film["Title"]} (${film["Year"]}) <button name="nominate" ${disableButton(film["imdbID"])} value="${i}" id="${film["imdbID"]}"}>Nominate</button></li>`;
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
                    console.log(val);
                    n.disabled = true;
                });
            }
        }
    });
    return num;
};

let disableButton = (movieId) =>{
    return (localStorage.getItem(movieId) != null || nominationsIsFull())? "disabled":"";
};

let nominationsIsFull = () =>{
    return Object.keys(localStorage).length == MAX_NOMINEES;
};

let populateNominees = () => {
    let keys = Object.keys(localStorage);
    if(keys.length != 0){
        $$("nominations").innerHTML = "";
    }
    for(let key of keys){
        addNominee(JSON.parse(decodeURIComponent(localStorage.getItem(key))));
    }
};

let addNominee = (item) => {
    $$("nominations").insertAdjacentHTML( 'beforeend', `<p id="nom${item["imdbID"]}">${item["Title"]} (${item["Year"]}) <button id="rem${item["imdbID"]}">Remove</button></p>`);
    $$(`rem${item["imdbID"]}`).addEventListener('click', () => {removeNominee(item["imdbID"])});
};

let removeNominee = (id) => {
    localStorage.removeItem(id);
    let nominateBtn = $$(id);
    let par = $$(`nom${id}`);
    par.parentNode.removeChild(par);
    if(nominateBtn != undefined){
        nominateBtn.disabled = false;
    }
    let keys = Object.keys(localStorage);
    if(keys.length == 0){
        $$("nominations").innerHTML = "<p>No nominations yet!</p>"
    }
};