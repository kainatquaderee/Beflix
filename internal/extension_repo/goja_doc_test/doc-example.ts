/// <reference path="./doc.d.ts" />

class Provider {
    async test() {

        const document = new Doc(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Document</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Main Title</h1>
        <nav>
            <ul id="main-nav" class="nav-list">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    <section id="content">
        <article class="post" data-id="1">
            <h2>First Post</h2>
            <p>This is the first post.</p>
            <a href="https://example.com/first-post" class="read-more">Read more</a>
        </article>
        <article class="post" data-id="2">
            <h2>Second Post</h2>
            <p>This is the second post.</p>
            <a href="https://example.com/second-post" class="read-more">Read more</a>
        </article>
        <article class="post" data-id="3">
            <h2>Third Post</h2>
            <p>This is the third post.</p>
            <a href="https://example.com/third-post" class="read-more">Read more</a>
        </article>
    </section>
    <aside>
        <h2>Sidebar</h2>
        <ul class="sidebar-list">
            <li><a href="#link1">Link 1</a></li>
            <li><a href="#link2">Link 2</a></li>
            <li><a href="#link3">Link 3</a></li>
        </ul>
    </aside>
    <footer>
        <p>&copy; 2024 Example Company. All rights reserved.</p>
        <p><a href="mailto:info@example.com">Contact Us</a></p>
    </footer>
</body>
</html>
        `)

        console.log("Document created")

        console.log(document.find("section").children().length())

        console.log(">>> Last post by string selector")
        const article = document.find("article:last-child")
        console.log(article.html())


        //
        //

        console.log(">>> Post titles")
        const titles = document.find("article").children("h2")
        titles.each((i, e) => {
            console.log(i, e.text())
            // Closest
            console.log(e.closest("article").html())
        })

        //
        //

        console.log(">>> Post links")
        const links = document.find("article").children("a")
        links.each((i, e) => {
            console.log(i, e.attr("href"))
        })

        console.log(">>> Parent of first link")
        const firstLink = links.first()
        console.log(firstLink.parent().text())


        console.log(">>> END")

    }
}
