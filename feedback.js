const form = document.getElementById("feedbackForm");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");
const toast = document.getElementById("toast");

function showToast(text) {
    toast.textContent = text;
    toast.setAttribute("aria-hidden", "false");
    toast.classList.add("visible");
    setTimeout(() => {
        toast.classList.remove("visible");
        toast.setAttribute("aria-hidden", "true");
    }, 3000);
}

function clearErrors() {
    document.getElementById("nameError").textContent = "";
    document.getElementById("ratingError").textContent = "";
    document.getElementById("commentError").textContent = "";
    message.textContent = "";
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();

    const name = document.getElementById("name").value.trim();
    const rating = document.getElementById("rating").value;
    const comment = document.getElementById("comment").value.trim();

    let hasError = false;
    if (name === "") {
        document.getElementById("nameError").textContent = "Please enter your name.";
        hasError = true;
    }
    if (rating === "") {
        document.getElementById("ratingError").textContent = "Please select a rating.";
        hasError = true;
    }
    if (comment === "") {
        document.getElementById("commentError").textContent = "Please write your feedback.";
        hasError = true;
    }
    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
        const response = await fetch("/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                rating: Number(rating),
                comment: comment
            })
        });

        const data = await response.json();

        if (response.ok) {
            message.textContent = data.message || "Feedback submitted.";
            showToast("Thanks — your feedback was submitted.");
            form.reset();
        } else {
            message.textContent = data.message || "Submission failed.";
            showToast("Submission failed. Try again.");
        }

    } catch (error) {
        message.textContent = "Something went wrong.";
        console.error(error);
        showToast("Network error. Your feedback is saved locally.");
        // fallback: persist to localStorage queue
        const queue = JSON.parse(localStorage.getItem("feedbackQueue") || "[]");
        queue.push({ name, rating: Number(rating), comment, createdAt: new Date().toISOString() });
        localStorage.setItem("feedbackQueue", JSON.stringify(queue));
        form.reset();
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Feedback";
    }
});

// attempt to flush local queue when online
window.addEventListener("online", async () => {
    const queue = JSON.parse(localStorage.getItem("feedbackQueue") || "[]");
    if (!queue.length) return;
    for (const item of queue) {
        try {
            await fetch("/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(item)
            });
        } catch (e) {
            console.error("Failed to flush queued feedback", e);
            return;
        }
    }
    localStorage.removeItem("feedbackQueue");
    showToast("Queued feedback synced.");
});