let $$ = (id) => { return document.getElementById(id);};

console.log($$("searchTitle"));
$$("searchTitle").addEventListener('change', ()=>{
    let searchText = $$("searchTitle").value;
    if(searchText == ""){
        $$("resultsHeader").textContent = "";
        $$("results").innerHtml = "";
    }
    else{
        $$("resultsHeader").textContent = `Results for "${searchText}"`;
        // perform API call
        fetch(`https://omdbapi.com/?apikey=bf80773c&s=${searchText}`).then((resp) => {
            return resp.json();
        }).then((info)=>{
            console.log(info);
            if(info["Response"] == "False"){
                $$("results").textContent = "That search returned no results.";
            } // if invalid call
            else{
                let films = info["Search"];
                let results = "<ul>";
                for(let film in films){
                    results += `<li>${film["Title"]} (${film["Year"]})`;
                }
                $$("results").innerHtml = results;
            }
        });
    }
})