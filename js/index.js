let $$ = (id) => { return document.getElementById(id);};

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
                results += `<li>${film["Title"]} (${film["Year"]}) <button name="nominate" value="${i}" id="${film["imdbID"]}"}>Nominate</button></li>`;
            }
            results+="</ul>"
            $$("results").innerHTML = results;
            num = parseInt(info["totalResults"]);
            let nominates = document.getElementsByName("nominate");
            for(let n of nominates){
                n.addEventListener('click', ()=>{
                    let val = films[n.value];
                    $$("nominations").innerHTML += `<p>${val["Title"]} (${val["Year"]})</p>`;
                    console.log(val);
                });
            }
        }
    });
    return num;
};