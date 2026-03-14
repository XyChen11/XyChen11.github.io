

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'researchexperience', 'awards', 'teaching']
const content_extensions = ['html', 'md']

const OPEN_SOURCE_NOTICE = 'This site is open source. Improve this page.'


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


function removeOpenSourceNotice(target) {
    if (!target) {
        return;
    }

    // Remove the common template notice if it exists as text in the section.
    target.querySelectorAll('p, div, span, a, li').forEach((node) => {
        const text = (node.textContent || '').trim();
        if (text === OPEN_SOURCE_NOTICE) {
            node.remove();
        }
    });

    if ((target.textContent || '').includes(OPEN_SOURCE_NOTICE)) {
        target.innerHTML = target.innerHTML.replaceAll(OPEN_SOURCE_NOTICE, '');
    }
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
                removeOpenSourceNotice(target);
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

}); 
