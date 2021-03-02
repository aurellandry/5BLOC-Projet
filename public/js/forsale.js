window.onload = ethWeb3.eth.getAccounts( (error, accounts) => {
    ethWeb3.eth.defaultAccount = accounts[0];
}).then(() => {
    loadForSalesTokens();
});

$('#updateForSalesButtonID').on('click', loadForSalesTokens);

function loadForSalesTokens(){
    console.log("Chargement des tokens à vendre...");
    const doneListing = [];
    let i = 0;
    let dbVals;
    if (isOkToCall){
        $('.forSaleTokensPanel').html('');
        realEstateContract.methods.getAllTokens().call().then((tokens) => {
            console.log(tokens);
            tokens.forEach(token => {
                updateForSaleListDisplay(token);
            });
            //$('.ownTokensPanel').html('<p>'+res[0]+'</p>');
            //alert("Token acheté avec succès !");
        });
    }
    else{
        console.log("Erreur Web3JS.");
    }
}


function buyToken(){
    let isConfirm = confirm(`
        Début de transaction avec ${this.dataset.owner} pour le token id ${this.dataset.tokenid}. 
        Le contrat ${contractAddress} qui effectue la transaction prélèvera 10% de commission.

        Êtes-vous sûr de vouloir continuer ?
    `);
    if(!isConfirm) return;
    console.log(isConfirm);
    realEstateContract.methods.transferToken(ethWeb3.eth.defaultAccount, this.dataset.tokenid)
    .send({from: ethWeb3.eth.defaultAccount}, (err, res) => {
        //console.log(res);
        if(err){
            if(err.code == 4001) {
                alert("Paiement rejeté ! ")
            }
            else {
                alert("Une erreur s'est produite !");
                throw err;
            };
        }
        else{
            realEstateContract.methods.transferEther(this.dataset.owner).send({from: ethWeb3.eth.defaultAccount, value: ethWeb3.utils.toWei(this.dataset.price, "ether")})
            alert("Token acheté avec succès !");
            loadForSalesTokens();
        }
    });
}

function updateForSaleListDisplay(token){
    if(token.tokenID == 0) return;
    var html = $('.forSaleTokensPanel').html();
    $('.forSaleTokensPanel').html(`
    ${html}
    <div class="col-sm-6">
        <div class="w3-card-4 property">
            <table>
                <tr><td><span class="fa fa-info"></span>&nbsp; TokenID :</td><td>${token["tokenID"]}</td></tr>
                <tr><td><span class="fa fa-user"></span>&nbsp; Propriétaire :</td><td title="${token["ownerAddress"]}">${token["ownerAddress"].slice(0,10)}...${token["ownerAddress"].slice(-10)}</td></tr>
                <tr><td><span class="fa fa-money"></span> Prix :</td><td>${token["cost"]} ETH</td></tr>
                <tr><td><span class="fa fa-map-marker"></span>&nbsp;&nbsp;Lieu :</td><td>${token["location"]}</td></tr>
            </table>
            <div style="text-align:center;padding-top:20px;">
                <button data-tokenid="${token["tokenID"]}" data-owner="${token["ownerAddress"]}" data-price="${token["cost"]}" data-location="${token["location"]}" class="w3-btn buy-property-button" style="background-color:#E7AB0A;color:#fff;">Acheter</button>
            </div>
        </div>
    </div>
    `);

    $('.buy-property-button').on('click', buyToken);
};