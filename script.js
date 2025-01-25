// Smooth scrolling and section visibility
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default anchor behavior
        const targetId = this.getAttribute("href"); // Get the target section ID
        const targetSection = document.querySelector(targetId); // Find the target section

        // Hide all sections
        document.querySelectorAll(".section").forEach((section) => {
            section.classList.remove("active");
        });

        // Show the target section
        if (targetSection) {
            targetSection.classList.add("active");
            targetSection.scrollIntoView({
                behavior: "smooth", // Smooth scroll
                block: "start", // Align to the top of the section
            });
        }
    });
});

// Show the first section by default on page load
window.addEventListener("load", () => {
    document.querySelector("#about").classList.add("active");
});

// Update footer year dynamically
const year = new Date().getFullYear();
document.getElementById("year").textContent = year;
