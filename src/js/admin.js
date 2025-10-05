Admin = {
  web3Provider: null,
  contracts: {},
  account: null,

  init: function () {
    console.log("Admin initialized");
    return Admin.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) {
      Admin.web3Provider = window.ethereum;
      web3 = new Web3(window.ethereum);
      console.log("Web3 initialized for Admin panel");
    } else {
      alert("Please install MetaMask!");
      return;
    }
    return Admin.initContract();
  },

  initContract: function () {
    $.getJSON("Election.json", function (election) {
      Admin.contracts.Election = TruffleContract(election);
      Admin.contracts.Election.setProvider(Admin.web3Provider);
      console.log("Election contract loaded for Admin panel");
    });
  },

  // ✅ Always open MetaMask popup on click
  connectWallet: async function () {
    try {
      // Force popup each time (reset permissions)
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      Admin.account = accounts[0];
      console.log("Connected Admin account:", Admin.account);

      $("#adminAddress").html("Connected Account: " + Admin.account);
      return Admin.render();
    } catch (error) {
      console.error("MetaMask connection failed:", error);
      alert("Connection rejected. Please unlock MetaMask to continue.");
    }
  },

  render: async function () {
    if (!Admin.account) {
      alert("Please connect your wallet first!");
      return;
    }

    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    try {
      const electionInstance = await Admin.contracts.Election.deployed();
      const adminAddress = await electionInstance.getAdmin();

      console.log("Contract admin:", adminAddress);
      console.log("Connected account:", Admin.account);

      if (adminAddress.toLowerCase() !== Admin.account.toLowerCase()) {
        alert("Access Denied! Only the admin can add candidates.");
        window.location.href = "index.html";
      } else {
        loader.hide();
        content.show();
      }
    } catch (err) {
      console.error("Render error:", err);
      alert("Error loading contract: " + err.message);
    }
  },

  addCandidate: async function () {
    const candidateName = $("#candidateName").val().trim();
    if (!candidateName) {
      alert("Please enter a valid candidate name.");
      return;
    }

    if (!Admin.account) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const electionInstance = await Admin.contracts.Election.deployed();
      const tx = await electionInstance.addCandidate(candidateName, {
        from: Admin.account,
      });

      console.log("Candidate added:", tx);
      $("#message").html("✅ Candidate added successfully!");
      $("#candidateName").val("");
    } catch (err) {
      console.error("Error adding candidate:", err);
      alert("Error: " + (err.data?.message || err.message));
    }
  },
};
