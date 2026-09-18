const feedbackContainer = document.getElementById("feedbackContainer");
const searchInput = document.getElementById("searchInput");
const filterRating = document.getElementById("filterRating");
const sortBy = document.getElementById("sortBy");

let lastFetched = [];

async function updateFeedback(item) {
    const newName = prompt("Enter new name:", item.name);
    if (newName === null) return;

    const newRatingText = prompt("Enter new rating (1-5):", item.rating);
    if (newRatingText === null) return;

    const newRating = Number(newRatingText);
    if (Number.isNaN(newRating) || newRating < 1 || newRating > 5) {
        alert("Rating must be a number between 1 and 5");
        return;
    }

    const newComment = prompt("Enter new comment:", item.comment);
    if (newComment === null) return;

    try {
        const response = await fetch(`/feedback/${item._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: newName.trim(),
                rating: newRating,
                comment: newComment.trim()
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            getFeedback();
        } else {
            alert(data.message || "Update failed");
        }
    } catch (error) {
        console.log(error);
        alert("Something went wrong while updating feedback");
    }
}

async function getFeedback() {
    try {
        const response = await fetch("/feedback");
        const feedback = await response.json();
        lastFetched = feedback;
        renderList();
    } catch (error) {
        console.log(error);
        feedbackContainer.innerHTML = "<p>Failed to load feedback.</p>";
    }
}

function applyFilters(items) {
    let result = items.slice();
    const q = searchInput?.value.trim().toLowerCase();
    if (q) {
        result = result.filter(i => (i.name || "").toLowerCase().includes(q) || (i.comment || "").toLowerCase().includes(q));
    }
    const fr = filterRating?.value;
    if (fr) {
        result = result.filter(i => Number(i.rating) === Number(fr));
    }
    const s = sortBy?.value;
    if (s === "rating_desc") result.sort((a,b) => b.rating - a.rating);
    if (s === "rating_asc") result.sort((a,b) => a.rating - b.rating);
    if (s === "newest") result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
}

function renderList() {
    const feedback = applyFilters(lastFetched || []);
    if (!feedback.length) {
        feedbackContainer.innerHTML = "<p class=\"empty-state\">No feedback available.</p>";
        return;
    }
    feedbackContainer.innerHTML = "";
    feedback.forEach((item) => {
        const feedbackCard = document.createElement("div");
        feedbackCard.className = "feedback-card";

        const title = document.createElement("h3");
        title.textContent = item.name || "Anonymous";

        const meta = document.createElement("div");
        meta.className = "meta-row";
        const rating = document.createElement("div");
        rating.className = "stars";
        rating.textContent = "⭐".repeat(item.rating || 0);
        const date = document.createElement("small");
        date.textContent = item.createdAt ? new Date(item.createdAt).toLocaleString() : "";
        meta.appendChild(rating);
        meta.appendChild(date);

        const comment = document.createElement("p");
        comment.textContent = item.comment;

        const controls = document.createElement("div");
        controls.className = "card-controls";

        const updateButton = document.createElement("button");
        updateButton.type = "button";
        updateButton.textContent = "Update";
        updateButton.addEventListener("click", () => updateFeedback(item));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "danger";
        deleteButton.addEventListener("click", () => removeFeedback(item._id));

        controls.appendChild(updateButton);
        controls.appendChild(deleteButton);

        feedbackCard.appendChild(title);
        feedbackCard.appendChild(meta);
        feedbackCard.appendChild(comment);
        feedbackCard.appendChild(controls);
        feedbackContainer.appendChild(feedbackCard);
    });
}

async function removeFeedback(id) {
    if (!confirm("Delete this feedback? This action cannot be undone.")) return;
    try {
        const res = await fetch(`/feedback/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
            alert(data.message || "Deleted");
            getFeedback();
        } else {
            alert(data.message || "Delete failed");
        }
    } catch (e) {
        console.error(e);
        alert("Failed to delete feedback");
    }
}

function debounce(fn, delay=250){
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), delay); };
}

searchInput?.addEventListener('input', debounce(() => renderList(), 300));
filterRating?.addEventListener('change', () => renderList());
sortBy?.addEventListener('change', () => renderList());

getFeedback();