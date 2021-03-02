var isOkToCall = false;
var ethWeb3;

var realEstateContract;
var realEstateContractHook;
var realEstateContractEvent;

if (typeof web3 !== 'undefined')
{
    //console.log(ethereum);
    ethWeb3 = new Web3(ethereum);
    ethereum.enable();
    var message = '<li><h5>Metamask detected</h5></li>';  
    $('#initialStatusID').append(message);          
    $('#initID').hide();
    $('#main').show();
    //console.log("Metamask detected");
    
    realEstateContract = new ethWeb3.eth.Contract(contractABI, contractAddress);

    //set default account
    ethWeb3.eth.getAccounts( (error, accounts) =>
        {
            //console.log(accounts[0]);
            //$('#currentAcntDisplayID').text(accounts[0]);
            ethWeb3.eth.defaultAccount = accounts[0];
            //updateStatus("\nMetaMask Selected Account: " + ethWeb3.eth.defaultAccount);
            //realEstateContract.methods.addToken(accounts[0], "Paris", 9).send({from: accounts[0]});
        }
    );
    
    //console.log(realEstateContract.methods.getNoOfTokens(ethWeb3.eth.defaultAccount));

    
    /*realEstateContract.methods.getNoOfTokens("0x6176B1bDB3B040A2aDF05C7F741327146dA3E5b9").call().then((res, err) => {
        console.log(res);
    });*/
    //ethWeb3.eth.sendTransaction({from: accounts[0],to: contractAddress, value: ethWeb3.utils.toWei("5", "ether")})
    //realEstateContract.methods.transferEther("0x6176B1bDB3B040A2aDF05C7F741327146dA3E5b9").send({from: accounts[0], value: ethWeb3.utils.toWei("5", "ether")});

    //realEstateContractHook = realEstateContract.options.address = contractAddress;
    //console.log(realEstateContractHook);
    realEstateContractAddEvent = realEstateContract.events.Add({},'latest');
    realEstateContractTransferEvent = realEstateContract.events.TransferToken({},'latest');
    realEstateContractAddEvent.on('message',
        function(error, result)
        {
            if (!error)
            {
                console.log("\nAdd Event: Owner: " + result.args._owner + " , tokenID: " + result.args._landID);
                $('#loaderID2').hide(); 
            } else {
                console.log("\nAdd Event Error: " + error);
            }            
        }
    );
    realEstateContractTransferEvent.on('message',
        function(error, result)
        {
            if (!error)
            {
                console.log("\nTransfer Event: From: " + result.args._from + " , To: " + result.args._to + " , landID: " + result.args._landID);
                $('#loaderID2').hide(); 
            } else {
                console.log("\nTransfer Event Error: " + error);
            }            
        }
    );    

    //registering for selected account change in metamask
    var account = ethWeb3.eth.defaultAccount;
    var accountInterval = setInterval(function() {
        //console.log("Checking for Metamask account change: " + ethWeb3.eth.defaultAccount);        
        if (ethWeb3.eth.defaultAccount !== account) {
          account = ethWeb3.eth.defaultAccount;
          $('#currentAcntDisplayID').text(account);
        }
      }, 1000);


    isOkToCall = true; 
}
else
{
    var message = $('<li><h5>Metamask Not available. Install and Try again</h5></li>');
    $('#initialStatusID').append(message);      
    console.log("Metamask not detected");    
}