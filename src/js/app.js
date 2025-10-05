App = {
  web3Provider: null,
  contracts: {},
  account: null,

  init: function () {
    console.log("App initialized");
    return App.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      web3 = new Web3(window.ethereum);
      console.log("Web3 connected");
    } else {
      alert("Please install MetaMask!");
      return;
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Election.json", function (election) {
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);
      console.log("Contract loaded");
    });
  },

  // connectWallet: async function () {
  //   try {
  //     const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  //     App.account = accounts[0];
  //     $("#accountAddress").html("Connected Account: " + App.account);
  //     console.log("Connected account:", App.account);
  //     return App.render();
  //   } catch (error) {
  //     alert("Connection rejected. Please connect MetaMask to continue.");
  //   }
  // },
  connectWallet: async function () {
  try {
    // ❌ revoke existing permissions (forces MetaMask popup)
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }]
    });

    // ✅ then request new connection
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    App.account = accounts[0];
    console.log("Connected account:", App.account);

    $("#accountAddress").html("Connected Account: " + App.account);
    $("#connectedAcc").html(App.account);

    return App.render();
  } catch (error) {
    console.error("MetaMask connection failed:", error);
    alert("Connection rejected. Please unlock MetaMask to continue.");
  }
},


  render: async function () {
    if (!App.account) {
      alert("Please connect your wallet first!");
      return;
    }

    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    try {
      const electionInstance = await App.contracts.Election.deployed();
      const candidatesCount = (await electionInstance.candidatesCount()).toNumber();

      const candidatesResults = $("#candidatesResults");
      const candidatesSelect = $("#candidatesSelect");
      candidatesResults.empty();
      candidatesSelect.empty();

      // ✅ Use await in for-loop
      for (let i = 1; i <= candidatesCount; i++) {
        const candidate = await electionInstance.candidates(i);
        const id = candidate[0];
        const name = candidate[1];
        const voteCount = candidate[2];

        const row = `<tr><th>${id}</th><td>${name}</td><td>${voteCount}</td></tr>`;
        candidatesResults.append(row);

        const option = `<option value="${id}">${name}</option>`;
        candidatesSelect.append(option);
      }

      const hasVoted = await electionInstance.voters(App.account);

      if (hasVoted) {
        console.log("User already voted");
        $("form").hide();
      } else {
        $("form").show();
      }

      loader.hide();
      content.show();
    } catch (err) {
      console.error("Render error:", err);
      alert("Error loading data: " + err.message);
    }
  },

  castVote: async function () {
    const candidateId = $("#candidatesSelect").val();
    console.log("Selected candidate:", candidateId);
    console.log("Voter account:", App.account);

    if (!App.account) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const electionInstance = await App.contracts.Election.deployed();

      console.log("Submitting transaction...");
      const tx = await electionInstance.vote(candidateId, { from: App.account });

      console.log("✅ Vote successful:", tx);
      alert("Vote cast successfully!");

      App.render(); // Refresh results
    } catch (err) {
      console.error("❌ Vote failed:", err);
      alert("Error: " + (err.data?.message || err.message));
    }
  },
};
