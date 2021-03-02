window.onload = ethWeb3.eth.getAccounts( (error, accounts) => {
    ethWeb3.eth.defaultAccount = accounts[0];
}).then(() => {
    loadMyTokens();
});

$('#updateMyTokensButtonID').on('click', loadMyTokens);
$('#addTokenButtonID').on('click', addToken);
$('#withdrawComm').on('click', withdrawCommissions);


function loadMyTokens(){
    console.log("Chargement des tokens du client connecté...");
    if (isOkToCall){
        $('.myTokensPanel').html('');
        realEstateContract.methods.getNoOfTokens(ethWeb3.eth.defaultAccount).call().then((nbTokens) => {
            for (var i = 0; i < nbTokens; i++) {
                realEstateContract.methods.getToken(ethWeb3.eth.defaultAccount, i).call().then((token) => {
                    console.log(token);
                    updateMyTokenListDisplay(token);
                    //$('.ownTokensPanel').html('<p>'+res[0]+'</p>');
                    //alert("Token acheté avec succès !");
                });
            }
        });
    }
    else{
        console.log("Erreur Web3JS.");
    }
}

function addToken(){
    console.log("Ajout d'un token...");
    if (isOkToCall){
        var location = $("#addToken-location").val();
        var cost = $("#addToken-cost").val();

        console.log(cost);
        console.log(location);

        realEstateContract.methods.addToken(ethWeb3.eth.defaultAccount, location, parseInt(cost)).send({from: ethWeb3.eth.defaultAccount});
        loadMyTokens();
    }
    else{
        console.log("Erreur Web3JS.");
    }
}


function sellToken(){
    let isConfirm = confirm(`
        Mise en vente pour le token id ${this.dataset.tokenid}. Êtes-vous sûr de vouloir continuer ?
    `);

    if(!isConfirm) return;

    realEstateContract.methods.AddForSale(this.dataset.owner, this.dataset.tokenid)
    .send({from: ethWeb3.eth.defaultAccount}, (err, res) => {
        //console.log(res);
        if(err){
            alert("Une erreur s'est produite !");
            throw err;
        }
        else {
            loadMyTokens();
            alert("Token mis en vente avec succès !");
        }
    });
}

function removeTokenFromSale(){
    let isConfirm = confirm(`
        Êtes-vous sûr de vouloir enlever le token id ${this.dataset.tokenid} de la vente ?
    `);

    if(!isConfirm) return;

    realEstateContract.methods.RemoveFromSale(this.dataset.owner, this.dataset.tokenid)
    .send({from: ethWeb3.eth.defaultAccount}, (err, res) => {
        //console.log(res);
        if(err){
            alert("Une erreur s'est produite !");
            throw err;
        }
        else {
            alert("Token retiré de la vente avec succès !");
        }
    });
}

function withdrawCommissions() {
    realEstateContract.methods.withdraw().send({from: ethWeb3.eth.defaultAccount}, (err, res) => {
        if(err) throw err;
        if(res) alert("Commissions transférées dans votre portefeuilles");
    });
}

function updateMyTokenListDisplay(token){
    var html = $('.myTokensPanel').html();
    $('.myTokensPanel').html(`
    ${html}
    <div class="col-sm-6">
        <div class="w3-card-4 property">
            <table>
                <tr><td><span class="fa fa-info"></span>&nbsp; TokenID :</td><td>${token[3]}</td></tr>
                <tr><td><span class="fa fa-user"></span>&nbsp; Propriétaire :</td><td title="${token[2]}">${token[2].slice(0,10)}...${token[2].slice(-10)}</td></tr>
                <tr><td><span class="fa fa-money"></span> Prix :</td><td>${token[1]} ETH</td></tr>
                <tr><td><span class="fa fa-map-marker"></span>&nbsp;&nbsp;Lieu :</td><td>${token[0]}</td></tr>
            </table>
            <div style="text-align:center;padding-top:20px;">
                <button data-tokenid="${token[3]}" data-owner="${token[2]}" data-price="${token[1]}" data-location="${token[0]}" class="w3-btn sell-token-button" style="background-color:#E7AB0A;color:#fff">Mettre en vente</button>
                <button data-tokenid="${token[3]}" data-owner="${token[2]}" data-price="${token[1]}" data-location="${token[0]}" class="w3-btn remove-sell-token-button" style="background-color:#E7AB0A;color:#fff;">Enlever de la vente</button>
            </div>
        </div>
    </div>
    `);

    $('.sell-token-button').on('click', sellToken);
    $('.remove-sell-token-button').on('click', removeTokenFromSale);
};