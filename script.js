document.addEventListener('DOMContentLoaded', function () {
    function closest(element, selector) {
        if (Element.prototype.closest) {
            return element.closest(selector);
        }
        do {
            if (Element.prototype.matches && element.matches(selector)
                || Element.prototype.msMatchesSelector && element.msMatchesSelector(selector)
                || Element.prototype.webkitMatchesSelector && element.webkitMatchesSelector(selector)) {
                return element;
            }
            element = element.parentElement || element.parentNode;
        } while (element !== null && element.nodeType === 1);
        return null;
    }

    // social share popups
    Array.prototype.forEach.call(document.querySelectorAll('.share a'), function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            window.open(this.href, '', 'height = 500, width = 500');
        });
    });

    // In some cases we should preserve focus after page reload
    function saveFocus() {
        var activeElementId = document.activeElement.getAttribute("id");
        sessionStorage.setItem('returnFocusTo', '#' + activeElementId);
    }
    var returnFocusTo = sessionStorage.getItem('returnFocusTo');
    if (returnFocusTo) {
        sessionStorage.removeItem('returnFocusTo');
        var returnFocusToEl = document.querySelector(returnFocusTo);
        returnFocusToEl && returnFocusToEl.focus && returnFocusToEl.focus();
    }

    // show form controls when the textarea receives focus or backbutton is used and value exists
    var commentContainerTextarea = document.querySelector('.comment-container textarea'),
        commentContainerFormControls = document.querySelector('.comment-form-controls, .comment-ccs');

    if (commentContainerTextarea) {
        commentContainerTextarea.addEventListener('focus', function focusCommentContainerTextarea() {
            commentContainerFormControls.style.display = 'block';
            commentContainerTextarea.removeEventListener('focus', focusCommentContainerTextarea);
        });

        if (commentContainerTextarea.value !== '') {
            commentContainerFormControls.style.display = 'block';
        }
    }

    // Expand Request comment form when Add to conversation is clicked
    var showRequestCommentContainerTrigger = document.querySelector('.request-container .comment-container .comment-show-container'),
        requestCommentFields = document.querySelectorAll('.request-container .comment-container .comment-fields'),
        requestCommentSubmit = document.querySelector('.request-container .comment-container .request-submit-comment');

    if (showRequestCommentContainerTrigger) {
        showRequestCommentContainerTrigger.addEventListener('click', function () {
            showRequestCommentContainerTrigger.style.display = 'none';
            Array.prototype.forEach.call(requestCommentFields, function (e) { e.style.display = 'block'; });
            requestCommentSubmit.style.display = 'inline-block';

            if (commentContainerTextarea) {
                commentContainerTextarea.focus();
            }
        });
    }

    // Mark as solved button
    var requestMarkAsSolvedButton = document.querySelector('.request-container .mark-as-solved:not([data-disabled])'),
        requestMarkAsSolvedCheckbox = document.querySelector('.request-container .comment-container input[type=checkbox]'),
        requestCommentSubmitButton = document.querySelector('.request-container .comment-container input[type=submit]');

    if (requestMarkAsSolvedButton) {
        requestMarkAsSolvedButton.addEventListener('click', function () {
            requestMarkAsSolvedCheckbox.setAttribute('checked', true);
            requestCommentSubmitButton.disabled = true;
            this.setAttribute('data-disabled', true);
            // Element.closest is not supported in IE11
            closest(this, 'form').submit();
        });
    }

    // Change Mark as solved text according to whether comment is filled
    var requestCommentTextarea = document.querySelector('.request-container .comment-container textarea');

    if (requestCommentTextarea) {
        requestCommentTextarea.addEventListener('input', function () {
            if (requestCommentTextarea.value === '') {
                if (requestMarkAsSolvedButton) {
                    requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute('data-solve-translation');
                }
                requestCommentSubmitButton.disabled = true;
            } else {
                if (requestMarkAsSolvedButton) {
                    requestMarkAsSolvedButton.innerText = requestMarkAsSolvedButton.getAttribute('data-solve-and-submit-translation');
                }
                requestCommentSubmitButton.disabled = false;
            }
        });
    }

    // Disable submit button if textarea is empty
    if (requestCommentTextarea && requestCommentTextarea.value === '') {
        requestCommentSubmitButton.disabled = true;
    }

    // Submit requests filter form on status or organization change in the request list page
    Array.prototype.forEach.call(document.querySelectorAll('#request-status-select, #request-organization-select'), function (el) {
        el.addEventListener('change', function (e) {
            e.stopPropagation();
            saveFocus();
            closest(this, 'form').submit();
        });
    });

    // Submit requests filter form on search in the request list page
    var quickSearch = document.querySelector('#quick-search');
    quickSearch && quickSearch.addEventListener('keyup', function (e) {
        if (e.keyCode === 13) { // Enter key
            e.stopPropagation();
            saveFocus();
            closest(this, 'form').submit();
        }
    });

    function toggleNavigation(toggle, menu) {
        var isExpanded = menu.getAttribute('aria-expanded') === 'true';
        menu.setAttribute('aria-expanded', !isExpanded);
        toggle.setAttribute('aria-expanded', !isExpanded);
    }

    function closeNavigation(toggle, menu) {
        menu.setAttribute('aria-expanded', false);
        toggle.setAttribute('aria-expanded', false);
        toggle.focus();
    }

    var burgerMenu = document.querySelector('.header .menu-button');
    var userMenu = document.querySelector('#user-nav');

    burgerMenu.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleNavigation(this, userMenu);
    });


    userMenu.addEventListener('keyup', function (e) {
        if (e.keyCode === 27) { // Escape key
            e.stopPropagation();
            closeNavigation(burgerMenu, this);
        }
    });

    if (userMenu.children.length === 0) {
        burgerMenu.style.display = 'none';
    }

    // Toggles expanded aria to collapsible elements
    var collapsible = document.querySelectorAll('.collapsible-nav, .collapsible-sidebar');

    Array.prototype.forEach.call(collapsible, function (el) {
        var toggle = el.querySelector('.collapsible-nav-toggle, .collapsible-sidebar-toggle');

        el.addEventListener('click', function (e) {
            toggleNavigation(toggle, this);
        });

        el.addEventListener('keyup', function (e) {
            if (e.keyCode === 27) { // Escape key
                closeNavigation(toggle, this);
            }
        });
    });

    // Submit organization form in the request page
    var requestOrganisationSelect = document.querySelector('#request-organization select');

    if (requestOrganisationSelect) {
        requestOrganisationSelect.addEventListener('change', function () {
            closest(this, 'form').submit();
        });
    }

    // If a section has more than 6 subsections, we collapse the list, and show a trigger to display them all
    const seeAllTrigger = document.querySelector("#see-all-sections-trigger");
    const subsectionsList = document.querySelector(".section-list");

    if (subsectionsList && subsectionsList.children.length > 6) {
        seeAllTrigger.setAttribute("aria-hidden", false);

        seeAllTrigger.addEventListener("click", function (e) {
            subsectionsList.classList.remove("section-list--collapsed");
            seeAllTrigger.parentNode.removeChild(seeAllTrigger);
        });
    }

    // If multibrand search has more than 5 help centers or categories collapse the list
    const multibrandFilterLists = document.querySelectorAll(".multibrand-filter-list");
    Array.prototype.forEach.call(multibrandFilterLists, function (filter) {
        if (filter.children.length > 6) {
            // Display the show more button
            var trigger = filter.querySelector(".see-all-filters");
            trigger.setAttribute("aria-hidden", false);

            // Add event handler for click
            trigger.addEventListener("click", function (e) {
                e.stopPropagation();
                trigger.parentNode.removeChild(trigger);
                filter.classList.remove("multibrand-filter-list--collapsed")
            })
        }
    });
});


/*
 * Begin Customisations
 */

$(document).ready(function () {

    /*
     * Set initial variables
     */

    var url_location = window.location.href;
    var system_owners_category_id = HC_SETTINGS.system_owners_category_id;
    var system_installers_category_id = HC_SETTINGS.system_installers_category_id;
    var owner_form_id = HC_SETTINGS.system_owners_form_id;
    var installer_form_id = HC_SETTINGS.system_installers_form_id;
    var installer_hidden_fields = HC_SETTINGS.system_installers_hidden_fields;
    var owner_hidden_fields = HC_SETTINGS.system_owners_hidden_fields;

    let selectedSuggestedArticle = null;

    /*
     * Show Support Type from header on all but Home page / landing page
     */

    if (url_location !== HC_SETTINGS.base_url) {
        $("#header-support-link").removeClass('hidden');
    }

    /* Community and GA tracking */
    $(".community-link").hover(function () {
        event.preventDefault();
        $('.support-link-box').hide();
        $('.coming-soon').toggle();
    });

    /*
     * Getting Started Guide Customisations
     */

    if ($('.gs-sidenav').length) {
        var gs_sidenav = '<ul>';
        $('h2.side-nav').each(function (a, b, c) {
            var link_id = $(this).prop('id');
            var text_content = $(this).text();
            gs_sidenav += '<li>';
            gs_sidenav += '<a href="#' + link_id + '" class="sidenav-item">' + text_content + '</a>';
            gs_sidenav += '</li>';
            $('.gs-sidenav').html(gs_sidenav);
        });

        // Highlight current page menu item as user scrolls
        var lastId,
            pageMenu = $(".gs-sidenav"),
            pageMenuHeight = pageMenu.outerHeight() + 126,
            menuItems = pageMenu.find("a"),
            scrollItems = menuItems.map(function () {
                var item = $($(this).attr("href"));
                if (item.length) { return item; }
            });

        $(window).scroll(function () {
            var fromTop = $(this).scrollTop() + pageMenuHeight;
            var cur = scrollItems.map(function () {
                if ($(this).offset().top < fromTop)
                    return this;
            });

            cur = cur[cur.length - 1];
            var id = cur && cur.length ? cur[0].id : "";

            if (lastId !== id) {
                lastId = id;
                // Set/remove active class
                menuItems
                    .parent().removeClass("active")
                    .end().filter("[href=#" + id + "]").parent().addClass("active");
            }
        });
    }


    /*
     * Build Sections and Articles Tree
     */

    if (url_location.indexOf('sections') > -1) {
        var articles = [];
        var sections = [];
        var section_id = url_location.split('/')[6].split('-')[0];
        var sections_html = '';
        var section_url = '/api/v2/help_center/en-gb/sections/' + section_id + '.json';
        getSection(section_url);
    }

    function getArticles(articles_url) {
        return $.getJSON(articles_url, function (data) {
            for (var i = 0; i < data.articles.length; i++) {
                articles.push(data.articles[i]);
            }
            if (data.next_page) {
                getArticles(data.next_page);
            } else {
                return articles;
            }

            /*
                  for (var j = 0; j < data.sections.length; j++) {
                    var inArray = false;
                    for (var k = 0; k < sections.length; k++) {
                      if (data.sections[j].id === sections[k].id) {
                        inArray = true;
                      }
                    }
                    if (inArray === false) {
                      sections.push(data.sections[j]);
                    }
                  }
                  */
        });
    }

    function getSections(sections_url) {
        return $.getJSON(sections_url, function (data) {
            return data.sections;
        });
    }

    function getSection(section_url) {
        $.getJSON(section_url, function (data) {
            var category_id = data.section.category_id;
            var articles_url = '/api/v2/help_center/en-gb/categories/' + data.section.category_id + '/articles.json?per_page=100&include=sections';
            var sections_url = '/api/v2/help_center/en-gb/categories/' + data.section.category_id + '/sections.json?per_page=100';
            $.when(getArticles(articles_url), getSections(sections_url)).done(
                function (data1, data2) {
                    formatArticles(data1[0].articles, data2[0].sections);
                }
            );
        });
    }

    function formatArticles(articles, sections) {
        var section = {};
        section.child_sections = [];
        var child_sections = [];

        /*
         * Filter child segments
         */

        var new_sections = [];
        sections.sort((a, b) => (a.position > b.position) ? 1 : ((b.position > a.position) ? -1 : 0));
        for (var i = 0; i < sections.length; i++) {
            sections[i].articles = [];
            sections[i].child_sections = [];
            if (sections[i].parent_section_id) {
                child_sections.push(sections[i]);
            }
            for (var j = 0; j < articles.length; j++) {
                if (articles[j].section_id == sections[i].id) {
                    var article = {
                        'title': articles[j].title,
                        'html_url': articles[j].html_url
                    }
                    sections[i].articles.push(article);
                }
            }
        }

        /*
         * Build nested section structure
         */

        for (var l = 0; l < child_sections.length; l++) {
            if (child_sections[l].parent_section_id == section_id) {
                section.child_sections.push(child_sections[l]);
            }
        }

        for (var l = 0; l < section.child_sections.length; l++) {
            section.child_sections[l].child_sections = [];
            for (var m = 0; m < child_sections.length; m++) {
                if (child_sections[m].parent_section_id == section.child_sections[l].id) {
                    section.child_sections[l].child_sections.push(child_sections[m]);
                }
            }
        }

        sections_html += '<ul class="section-list section-list--collapsed">';
        for (var n = 0; n < section.child_sections.length; n++) {
            sections_html += '<li class="section-list-item">';
            sections_html += '<a id="' + section.child_sections[n].id + '" class="subsection-title"><h2><span>' + section.child_sections[n].name + '</span></h2><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" focusable="false" viewBox="0 0 16 16" aria-hidden="true"> <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 14.5l6.1-6.1c.2-.2.2-.5 0-.7L5 1.5"></path> </svg></a>';
            if (section.child_sections[n].child_sections.length > 0) {
                sections_html += '<div class="child-section-div" style="display:none;">';
                sections_html += '<ul>';
                for (var o = 0; o < section.child_sections[n].child_sections.length; o++) {
                    sections_html += '<li class="child-section-list-item">';
                    sections_html += '<a id="' + section.child_sections[n].child_sections[o].id + '" class="child-section-title"><h4>' + section.child_sections[n].child_sections[o].name + '</h4><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" focusable="false" viewBox="0 0 16 16" aria-hidden="true"> <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 14.5l6.1-6.1c.2-.2.2-.5 0-.7L5 1.5"></path> </svg></a>';
                    if (section.child_sections[n].child_sections[o].articles.length > 0) {
                        sections_html += '<div class="child-section-articles-div" style="display:none;">';
                        sections_html += '<ul>';
                        for (var q = 0; q < section.child_sections[n].child_sections[o].articles.length; q++) {
                            sections_html += '<li class="child-section-article-item">';
                            sections_html += '<a href="' + section.child_sections[n].child_sections[o].articles[q].html_url + '" class="subsection-title"><span>' + section.child_sections[n].child_sections[o].articles[q].title + '</span></a>';
                            sections_html += '</li>';
                        }
                        sections_html += '</ul>';
                        sections_html += '</div>';
                    }
                    sections_html += '</li>';
                }
                sections_html += '</ul>';
                sections_html += '</div>';
            }
            if (section.child_sections[n].articles.length > 0) {
                sections_html += '<div class="child-section-div" style="display:none;">';
                sections_html += '<ul>';
                for (var p = 0; p < section.child_sections[n].articles.length; p++) {
                    sections_html += '<li class="child-section-list-item">';
                    sections_html += '<a href="' + section.child_sections[n].articles[p].html_url + '" class="subsection-title"><span>' + section.child_sections[n].articles[p].title + '</span></a>';
                    sections_html += '</li>';
                }
                sections_html += '</ul>';
                sections_html += '</div>';
            }
            sections_html += '</li>';
        }
        sections_html += '</ul>';

        $('header.page-header').after(sections_html);
        $('a.subsection-title, a.child-section-title').click(function (e) {
            $(this).toggleClass('active');
            $(this).next().toggle();
        });
    }

    /*
     * Control display of 'Support Link' in header
     */

    var support_link_text = (url_location.indexOf(system_owners_category_id) > -1 || url_location.indexOf(owner_form_id) > -1) ? 'System Owners Support' : 'SA Reseller Support';

    var request_link = (sessionStorage.getItem('request_link')) ? sessionStorage.getItem('request_link') : '';
    if (url_location.indexOf(system_installers_category_id) > -1) {
        request_link = HC_SETTINGS.base_url + '/requests/new?ticket_form_id=' + installer_form_id;
        sessionStorage.setItem('request_link', request_link);
    } else if (url_location.indexOf(system_owners_category_id) > -1) {
        request_link = HC_SETTINGS.base_url + '/requests/new?ticket_form_id=' + owner_form_id;
        sessionStorage.setItem('request_link', request_link);
    }
    $('#footer-request-link').attr('href', request_link);
    $('.system-installers-link').click(function () {
        $('.support-link-box').hide();
    });
    $('.system-owners-link').click(function () {
        $('.support-link-box').hide();
    });


    /*
     * Create promoted articles display for
     * System Owner and Installer category pages
     */

    var promoted_articles = [];
    var promoted_sections = [];
    var data_sections = [];

    function getPromotedArticles(articles_url) {
        $.getJSON(articles_url, function (data) {
            for (var i = 0; i < data.articles.length; i++) {
                if (data.articles[i].promoted === true) {
                    if (promoted_sections.indexOf(data.articles[i].section_id) === -1) {
                        promoted_sections.push(data.articles[i].section_id);
                    }
                    promoted_articles.push(data.articles[i]);
                    if (promoted_sections.length === parseInt(HC_SETTINGS.faq_limit)) { break; }
                }
            }
            for (var j = 0; j < data.sections.length; j++) {
                var inArray = false;
                for (var k = 0; k < data_sections.length; k++) {
                    if (data_sections[k].id === data.sections[j].id) {
                        inArray = true;
                    }
                }
                if (inArray === false) {
                    data_sections.push(data.sections[j]);
                }
            }
            if (data.next_page) {
                getPromotedArticles(data.next_page);
            } else {
                formatPromotedArticles(promoted_articles, promoted_sections, data_sections);
            }
        });
    }

    if (url_location.indexOf('categories/') > -1) {
        var url_category_id = url_location.split('/')[6];
        var promo_articles_url = '/api/v2/help_center/en-gb/categories/' + url_category_id + '/articles.json?include=sections';

        getPromotedArticles(promo_articles_url);
    }

    function formatPromotedArticles(promoted_articles, promoted_sections, data_sections) {
        var promoted_sections_html = '<div class="article-list promoted-articles">';
        for (var j = 0; j < promoted_sections.length; j++) {
            promoted_sections_html += '<div class="promoted-section-container">';
            for (var k = 0; k < data_sections.length; k++) {
                if (data_sections[k].id === promoted_sections[j]) {
                    promoted_sections_html += '<p class="promoted-section-title">';
                    promoted_sections_html += '<span class="promoted-section-title-text">' + data_sections[k].name + '</span>';
                    promoted_sections_html += '</p>';
                }
            }
            promoted_sections_html += '<ul class="promoted-section">';
            for (var l = 0; l < promoted_articles.length; l++) {
                if (promoted_articles[l].section_id === promoted_sections[j]) {
                    promoted_sections_html += '<li><a href="' + promoted_articles[l].html_url + '">' + promoted_articles[l].title + '</a></li>';
                }
            }
            promoted_sections_html += '</ul>';
            promoted_sections_html += '</div>';
        }
        promoted_sections_html += '</div>';

        $('#promoted-items-list').append(promoted_sections_html);
    }


    /* Customise display of request forms*/

    if (url_location.indexOf(owner_form_id) > -1 || url_location.indexOf(installer_form_id) > -1) {
        $('#upload-dropzone').parent().hide();
        $('#new_request footer').hide();
        $(owner_hidden_fields).addClass('hide-form-fields');
        $(installer_hidden_fields).addClass('hide-form-fields');
    }

    $('.email-support').click(function () {
        var installer_hidden_fields = HC_SETTINGS.system_installers_hidden_fields;
        var owner_hidden_fields = HC_SETTINGS.system_owners_hidden_fields;
        if (url_location.indexOf(owner_form_id) > -1) { $(owner_hidden_fields).removeClass('hide-form-fields'); }
        if (url_location.indexOf(installer_form_id) > -1) { $(installer_hidden_fields).removeClass('hide-form-fields'); }
        $('.suggested-articles-container').hide();
        $('#suggested-article-modal').hide();
        $('.request_subject, .request_description, #new_request footer').show();
        $('.request_anonymous_requester_email').show().insertBefore('.request_subject');
        $('#upload-dropzone').parent().show();
    });

    $(".support-link").click(function (event) {
        event.preventDefault();
        $(".support-link-box").toggle();
    });

    $(".support-link").mouseenter(function (event) {
        $(".support-link-box").show();
    });

    var support_menu_timer;

    $(".support-link").mouseleave(function (event) {
        support_menu_timer = setTimeout(function () {
            $(".support-link-box").hide();
        }, 500);
    });

    $(".support-link-box").mouseenter(function () {
        clearTimeout(support_menu_timer);
    });

    $(".support-link-box").mouseleave(function () {
        support_menu_timer = setTimeout(function () {
            $(".support-link-box").hide();
        }, 300);
    });

    /*
     * show more help options in suggested article modal window
     */

    $('.modal-need-help').click(function () {
        $('.modal-still-need-help').show();
    });

    /*
     * creating suggested article logic
     */

    if (url_location.indexOf(owner_form_id) > -1 || url_location.indexOf(installer_form_id) > -1) {

        $('.form-field label').each(function () {
            if ($(this).text().indexOf('How can we help you?') > -1) {
                var forSelector = '#' + $(this).attr('for');
                $(forSelector).on('change', function (e) {
                    $(installer_hidden_fields).addClass('hide-form-fields');
                    $(owner_hidden_fields).addClass('hide-form-fields');
                    $('#suggested-articles-container').hide();
                    if ($(this).val() === "feedback_systemowners" || $(this).val() === "feedback_resellers") {
                        $('#new_request footer, .request_anonymous_requester_email, .request_subject, .request_description').show();
                        $('#upload-dropzone').parent().show();
                    } else {
                        $('#new_request footer, .request_anonymous_requester_email, .request_subject, .request_description').hide();
                        $('#upload-dropzone').parent().hide();
                    }
                });
            }

            if ($(this).text().indexOf('Tell us more') > -1) {
                var forSelector = '#' + $(this).attr('for');
                $(forSelector).on('change', function (e) {
                    selectedSuggestedArticle = null; // Reset selection
                    $(installer_hidden_fields).addClass('hide-form-fields');
                    $(owner_hidden_fields).addClass('hide-form-fields');
                    $('#new_request footer, .request_anonymous_requester_email, .request_subject, .request_description').hide();
                    $('#upload-dropzone').parent().hide();
                    var url = '/api/v2/help_center/articles.json?label_names=' + $(this).val();
                    $.getJSON(url, function (data) {
                        var articles = data.articles;
                        var suggested_articles_html = '';
                        if (articles.length > 0) {
                            for (var i = 0; i < articles.length; i++) {
                                suggested_articles_html += '<p class="suggested-articles-p">';
                                suggested_articles_html += '<a class="suggested-article-link" id="suggested-article-' + articles[i].id + '" href="' + articles[i].html_url + '">' + articles[i].title + '</a>';
                                suggested_articles_html += '</p>';
                            }
                            $('#suggested-articles-text').html(suggested_articles_html).show();
                            $('#suggested-articles').show();
                            $('.suggested-article-link').click(function (e) {
                                event.preventDefault();

                                // Track suggested articles
                                selectedSuggestedArticle = $(`#${e.target.id}`).text();
                                ga('send', 'event', 'Suggested Articles', 'Click', selectedSuggestedArticle);

                                for (var j = 0; j < data.articles.length; j++) {
                                    if ($(this).prop('id').indexOf(articles[j].id) > -1) {
                                        var suggested_article_modal = '<h3>' + articles[j].title + '</h3><p class="suggested-article-text">' + articles[j].body + '</p>';
                                        $('#suggested-article-content').html(suggested_article_modal);
                                        $('#suggested-article-modal').show();
                                        $('#more-help-header').show();
                                    }
                                }
                            });
                        } else {
                            $('#suggested-articles-text').html(suggested_articles_html);
                            $('#suggested-articles').hide();
                            $('#more-help-header').show();
                        }
                    }).always(function () {
                        $('.suggested-articles-container').show();
                    });
                });
            }
        });

        $('.suggested-article-modal-close').click(function () {
            $('#suggested-article-modal').hide();
        });

    }

    /* Google Analytics */

    // Track articles where users try to submit a ticket
    $('#contact-us-article').click(() => {
        const articleTitle = $('h1').attr('title');
        ga('send', 'event', 'Contact Us', 'Click from article', articleTitle);
    });

    $('#contact-us-owner').click(() => {
        ga('send', 'event', 'Contact Us', 'Click from home', 'Owner');
    });

    $('#contact-us-installer').click(() => {
        ga('send', 'event', 'Contact Us', 'Click from home', 'Installer');
    });

    $('#footer-request-link').click(() => {
        ga('send', 'event', 'Contact Us', 'Click from home', 'Footer');
    });

    // Track the suggested article viewed before submitting the form
    $('#new_request').submit(() => {
        if (selectedSuggestedArticle != null) {
            ga('send', 'event', 'Submit Form', 'Submit after viewing suggested article', selectedSuggestedArticle);
        } else {
            ga('send', 'event', 'Submit Form', 'Submit immediately');
        }
    });

});


