

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'researchexperience', 'awards', 'teaching']
const content_extensions = ['md', 'html']


function fetchSectionContent(name) {
    const tryExtension = (index) => {
        if (index >= content_extensions.length) {
            throw new Error('Unable to load content for section: ' + name);
        }

        const extension = content_extensions[index];
        return fetch(content_dir + name + '.' + extension)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        return tryExtension(index + 1);
                    }

                    throw new Error('Failed to load ' + name + '.' + extension + ': ' + response.status);
                }

                return response.text().then(content => ({ extension, content }));
            });
    };

    return tryExtension(0);
}


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name) => {
        const target = document.getElementById(name + '-md');
        if (!target) {
            return;
        }

        fetchSectionContent(name)
            .then(({ extension, content }) => {
                const html = extension === 'html' ? content : marked.parse(content);
                target.innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

}); 
