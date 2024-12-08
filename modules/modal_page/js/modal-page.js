(function($, Drupal, drupalSettings) {
    'use strict';
    Drupal.behaviors.modalPage = {
        attach: function(context, settings) {
            var modals = $('.js-modal-page-show', context);
            if (!modals.length) {
                return false;
            }
            var verify_load_bootstrap_automatically = true;
            if (typeof settings.modal_page != 'undefined' && settings.modal_page.verify_load_bootstrap_automatically != 'undefined') {
                verify_load_bootstrap_automatically = settings.modal_page.verify_load_bootstrap_automatically;
            }
            if (!$.fn.modal && verify_load_bootstrap_automatically) {
                $.ajax({
                    url: "/modal-page/ajax/enable-bootstrap",
                    success: function(result) {
                        location.reload();
                    }
                });
            }
            $(modals).each(function(index) {
                var modal = $(this);
                var checkbox_please_do_not_show_again = $('.modal-page-please-do-not-show-again', modal);
                var id_modal = checkbox_please_do_not_show_again.val();
                var cookie_please_do_not_show_again = $.cookie('please_do_not_show_again_modal_id_' + id_modal);
                if (cookie_please_do_not_show_again) {
                    return false;
                }
                var auto_open = true;
                if (typeof modal.data('modal-options').auto_open != 'undefined' && typeof modal.data('modal-options').auto_open != 'undefined') {
                    auto_open = modal.data('modal-options').auto_open;
                }
                modal.on('shown.bs.modal', function() {
                    $(this).find(".js-modal-page-ok-buttom").first().focus();
                });
                modal.on('keydown', function(e) {
                    var keyCode = e.keyCode || e.which;
                    var lastElement = $(this).find('.js-modal-page-ok-buttom').last().is(':focus');
                    var firstElement = $(this).find(".js-modal-page-ok-buttom").first().is(':focus');
                    if (keyCode === 9 && !e.shiftKey && lastElement) {
                        e.preventDefault();
                        $(this).find(".js-modal-page-ok-buttom").first().focus();
                    } else if (keyCode === 9 && e.shiftKey && firstElement) {
                        e.preventDefault();
                        $(this).find(".js-modal-page-ok-buttom").last().focus();
                    }
                });
                if (auto_open == true) {
                    var delay = $('#js-modal-page-show-modal #delay_display', modal).val() * 1000;
                    setTimeout(function() {
                        modal.modal();
                    }, delay);
                }
                $('.open-modal-page', modal).on('click', function() {
                    modal.modal();
                });
                if (typeof modal.data('modal-options').open_modal_on_element_click != 'undefined' && modal.data('modal-options').open_modal_on_element_click) {
                    var link_open_modal = modal.data('modal-options').open_modal_on_element_click;
                    $(link_open_modal).on('click', function() {
                        modal.modal();
                    });
                }
                var ok_button = $('.js-modal-page-ok-button', modal);
                ok_button.on('click', function() {
                    if (checkbox_please_do_not_show_again.is(':checked')) {
                        $.cookie('please_do_not_show_again_modal_id_' + id_modal, true, {
                            expires: 365 * 20,
                            path: '/'
                        });
                    }
                    var modalElement = $('.js-modal-page-ok-button').parents('#js-modal-page-show-modal');
                    var urlModalSubmit = "/modal/ajax/hook-modal-submit";
                    var modalOptions = modalElement.data('modal-options');
                    var modalId = modalOptions.id;
                    var dontShowAgainOption = modalElement.find('.modal-page-please-do-not-show-again').is(':checked');
                    var modalState = new Object();
                    modalState.dont_show_again_option = dontShowAgainOption;
                    var params = new Object();
                    params.id = modalId;
                    params.modal_state = modalState;
                    $.post(urlModalSubmit, params, function(result) {});
                    var redirect = $(this).attr('data-redirect');
                    if (typeof redirect != 'undefined' && redirect.length > 0) {
                        window.location.replace(redirect);
                    }
                });
            });
        }
    };
})(jQuery, Drupal, drupalSettings);