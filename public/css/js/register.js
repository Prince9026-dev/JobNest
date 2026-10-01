let form = document.querySelector("form");
console.log("Enter in prompt file", form);

form.addEventListener("submit", function(e) {
    let role = document.getElementById("role").value;
    if (role.toLowerCase() === "hr") {
        let company = prompt("Enter your company name:");
        if (company === null || company.trim() === "") {
            e.preventDefault();
            alert("Company name is required!");
            return;
        }
        let input = document.createElement("input");
        input.type = "hidden";
        input.name = "company";
        input.value = company.trim();
        this.appendChild(input);
    }
});