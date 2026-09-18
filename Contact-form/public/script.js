 const form = document.getElementById("contactForm");
        const responseMessage = document.getElementById("response");

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const message = document.getElementById("message").value;

            try {
                const response = await fetch("/submit-contact", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        message
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    responseMessage.textContent = data.message;
                    responseMessage.className = "success";
                    form.reset();
                    loadContacts();
                } else {
                    responseMessage.textContent = data.message;
                    responseMessage.className = "error";
                }
            } catch (error) {
                console.error(error);
                responseMessage.textContent = "Unable to submit contact. Please try again.";
                responseMessage.className = "error";
            }
        });

        async function loadContacts() {
            try {
                const response = await fetch("/contacts");
                const contacts = await response.json();

                const container = document.getElementById("contactsContainer");
                container.innerHTML = "";

                contacts.forEach((contact) => {
                    const contactDiv = document.createElement("div");
                    contactDiv.className = "contact-card";
                    contactDiv.innerHTML = `
                        <h3>${contact.name}</h3>
                        <p><strong>Email:</strong> ${contact.email}</p>
                        <p><strong>Message:</strong> ${contact.message}</p>
                        <p><strong>Submitted:</strong> ${new Date(contact.submissionDate).toLocaleString()}</p>
                    `;
                    container.appendChild(contactDiv);
                });
            } catch (error) {
                console.error("Error loading contacts:", error);
            }
        }

        loadContacts();