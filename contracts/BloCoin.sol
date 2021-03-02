pragma solidity ^0.8.1;

contract BloCoin
{
    
    receive () payable external {}
    
    struct Token 
    {
        address ownerAddress;
        string location;
        uint cost;
        uint tokenID;
        uint wantSell;
    }
    
    address public owner;   // Propriétaire du contrat
    bool _switch = false;

    uint public totalTokensCounter = 0; // Nombre total de propriétés
    
    string[] myArray;
    
    // Constructeur
    constructor() public
    {
        owner = 0x4f332d20a4b738CBe44EdBfeB481E57865caAE60;
        totalTokensCounter = 0;
    }
    

    event Add(address _owner, uint _tokenID);
    event UpdateStatus(string _msg,uint _cost);
    event TransferToken(address indexed _from, address indexed _to, uint _tokenID);
    event BuyToken(address indexed _from, address indexed _to, uint _cost);
    
    modifier isOwner
    {
        require(msg.sender == owner);
        _;
    }
    
    mapping (address => Token[]) public __ownedTokens;
    Token[] public __forSaleTokens;
    mapping (address => uint) balance;
    

    // Création d'un token
    function addToken(address tokenOwner, string memory _location, uint _cost) public
    {
        totalTokensCounter = totalTokensCounter + 1;
        Token memory myToken = Token(
            {
                ownerAddress: tokenOwner,
                location: _location,
                cost: _cost,
                tokenID: totalTokensCounter,
                wantSell: 1
            });
        __ownedTokens[tokenOwner].push(myToken);
        __forSaleTokens.push(myToken);
        emit Add(msg.sender, totalTokensCounter);
    }

    // Achat d'un token
    function transferEther(address rec) public payable {
        require(address(this).balance > 0);
        payable(this).transfer(msg.value * 10 / 100);
        payable(rec).transfer(msg.value * 90 / 100);
        
        emit BuyToken(msg.sender, rec, msg.value);
    }
    
    function deleteForSaleToken(uint _tokenID) public {
        for(uint i=0; i < (__forSaleTokens.length);i++)    
        {
            if (__forSaleTokens[i].tokenID == _tokenID)
            {
                delete __forSaleTokens[i];
            }
        }
    }
    
    function getAllTokens() public payable returns (Token[] memory) {
        return __forSaleTokens;
    }
    
    // Envoyer le token à l'acheteur
    function transferToken(address _tokenBuyer, uint _tokenID) payable public returns (bool)
    {
        for(uint i=0; i < (__ownedTokens[msg.sender].length);i++)    
        {
            if (__ownedTokens[msg.sender][i].tokenID == _tokenID)
            {
                //copy token in new owner's collection
                Token memory myToken = Token(
                {
                    ownerAddress:_tokenBuyer,
                    location: __ownedTokens[msg.sender][i].location,
                    cost: __ownedTokens[msg.sender][i].cost,
                    tokenID: _tokenID,
                    wantSell: __ownedTokens[msg.sender][i].wantSell
                });
                __ownedTokens[_tokenBuyer].push(myToken);   
                
                delete __ownedTokens[msg.sender][i];

                emit TransferToken(msg.sender, _tokenBuyer, _tokenID);                
                
                return true;
            }
        }
        
        // En cas d'erreur
        return false;
    }
    
    // Récupérer le token
    function getToken(address _tokenHolder, uint _index) view public returns (string memory, uint, address,uint, uint)
    {
        return (__ownedTokens[_tokenHolder][_index].location, 
                __ownedTokens[_tokenHolder][_index].cost,
                __ownedTokens[_tokenHolder][_index].ownerAddress,
                __ownedTokens[_tokenHolder][_index].tokenID,
                __ownedTokens[_tokenHolder][_index].wantSell
                );
                
    }
    
    // Permet au propriétaire du contrat de récupérer le montant récolté par le contrat
    function withdraw() public {
        payable(owner).transfer(address(this).balance);
    }
    
    
    // Enlever le token de la vente
    function RemoveFromSale(address _tokenHolder, uint token_id) public returns (string memory){
        
        uint indexer;
        
        for(indexer=0; indexer < (__ownedTokens[_tokenHolder].length);indexer++){
             if ( __ownedTokens[_tokenHolder][indexer].tokenID == token_id ){
                 if ( __ownedTokens[_tokenHolder][indexer].wantSell == 1 ){
                     __ownedTokens[_tokenHolder][indexer].wantSell=0;
                     deleteForSaleToken(token_id);
                     return "OPERATION SUCCESSFULL";
                 }else{
                     return "TOKEN ALREADY NOT FOR SALE";
                 }
             }
         }
        
        return "INVALID TOKEN ID";
    }
    
    // Ajouter le token à la vente
    function AddForSale(address _tokenHolder, uint token_id) public returns (string memory){
        
        uint indexer;
        
        for(indexer=0; indexer < (__ownedTokens[_tokenHolder].length);indexer++){
            if ( __ownedTokens[_tokenHolder][indexer].tokenID == token_id ){
                if ( __ownedTokens[_tokenHolder][indexer].wantSell == 0 ){
                    __ownedTokens[_tokenHolder][indexer].wantSell=1;
                    __forSaleTokens[indexer] = __ownedTokens[_tokenHolder][indexer];
                    return "OPERATION SUCCESSFULL";
                }
                else{
                    return "TOKEN ALREADY FOR SALE";
                }
            }
         }
        
        return "INVALID TOKEN ID";
    }
    
    // Nombre total de tokens possédés par un compte
    function getNoOfTokens(address _tokenHolder) view public returns (uint)
    {
        return __ownedTokens[_tokenHolder].length;
    }

}

