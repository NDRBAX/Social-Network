window.onpopstate = function (event) {
  if (event.state) {
    console.log(event.state.section);
    clear();
    showSection(event.state.section);
  }
};

function clear() {
  try {
    document.querySelectorAll("#post").forEach((post) => {
      post.remove();
    });
    document.querySelector("#show-alert").style.display = "none";
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("a").forEach((link) => {
    link.onclick = () => {
      clear();
      const section = link.dataset.section;
      showSection(section);
      history.pushState({ section }, section, "#" + section);
    };
  });

  document.querySelector("#new-post-form").onsubmit = post_button;

  redirect();
});

function redirect() {
  const url = window.location.href;
  const section = url.split("#")[1];

  if (!url.includes("#")) {
    showSection("all-posts-section");
  } else {
    if (section.includes("profile")) {
      showSection("profile-section");
      console.log("profile");
    } else if (section.includes("following")) {
      showSection("following-section");
      console.log("following");
    } else if (section.includes("all-posts")) {
      showSection("all-posts-section");
      console.log("all-posts");
    }
  }
}

// Show the section with the given name
function showSection(section) {
  try {
    sections = ["profile-section", "following-section", "all-posts-section"];

    sections.forEach((p) => {
      if (p !== section) {
        document.querySelector(`#${p}`).style.display = "none";
      } else {
        document.querySelector(`#${p}`).style.display = "block";
      }
    });

    fetch_posts(section);
  } catch (error) {
    console.log(error);
  }
}

// fetch posts
function fetch_posts(name) {
  if (name === "all-posts-section" || name === "profile-section") {
    document.querySelector("#new-post-section").style.display = "block";

    fetch(`/network/${name}`)
      .then((response) => response.json())
      .then((posts) => {
        if (posts.length === 0) {
          document.querySelector(`#${name}`).innerHTML = "No posts to show";
        } else {
          posts.forEach((post) => {
            const post_element = document.createElement("div");
            post_element.setAttribute("id", "post");

            const ul = document.createElement("ul");
            ul.className = "list-group";
            post_element.appendChild(ul);

            const li = document.createElement("li");
            li.className = "list-group-item mb-1";
            li.innerHTML = post.content;
            ul.appendChild(li);

            document.querySelector(`#${name}`).append(post_element);
          });
        }
      });
  } else if (name === "following-section") {
    fetch(`/network/${name}`)
      .then((response) => response.json())
      .then((users) => {
        if (users.length === 0) {
          document.querySelector("#following-section").innerHTML =
            "No users to show";
        } else {
          users.forEach((user) => {
            const user_element = document.createElement("div");
            user_element.setAttribute("id", "user");

            const ul = document.createElement("ul");
            ul.className = "list-group";
            user_element.appendChild(ul);

            const li = document.createElement("li");
            li.className = "list-group-item mb-1";
            li.innerHTML = user;
            ul.appendChild(li);

            document.querySelector(`#${name}`).append(user_element);
          });
        }
      });
  } else {
    document.querySelector("#new-post-section").style.display = "none";
    document.querySelector("#pagination").style.display = "none";
  }
}

// make a new post
function new_post(event) {
  event.preventDefault();

  const content = document.querySelector("#new-post-content").value;
  document.querySelector("#new-post-content").value = "";

  fetch("/new-post", {
    method: "POST",
    body: JSON.stringify({
      content: content,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      if ("error" in result) {
        document.querySelector("#show-alert").style.display = "block";
        document.querySelector("#show-alert").innerHTML = result["error"];
      } else if ("message" in result) {
        document.querySelector("#show-alert").style.display = "block";
        document.querySelector("#show-alert").innerHTML = result["message"];
        console.log(content);
      }
    });
}

// post button
function post_button(event, section) {
  new_post(event);
  clear();

  if (section === "profile-section") {
    showSection("profile-section");
  } else {
    showSection("all-posts-section");
  }
  history.pushState({ section }, section, section);
}

// // pagination for displaying posts : 10 posts per page
// function pagination() {
//   const posts = document.querySelectorAll("#post");
//   const posts_per_page = 10;
//   const page_count = Math.ceil(posts.length / posts_per_page);

//   for (let i = 0; i < page_count; i++) {
//     const page = document.createElement("div");
//     page.className = "page";
//     page.id = "page-" + i;

//     for (let j = 0; j < posts_per_page; j++) {
//       const index = i * posts_per_page + j;
//       if (index < posts.length) {
//         page.appendChild(posts[index]);
//       }
//     }

//     document.querySelector("#all-posts-section").appendChild(page);
//   }

//   document.querySelector("#page-0").style.display = " block";
// }
