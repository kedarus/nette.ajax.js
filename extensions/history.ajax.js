(function($, undefined) {

// Is History API reliably supported? (based on Modernizr & PJAX)
if (!(window.history && history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/))) return;

$.nette.ext('redirect', false);

var findSnippets = function () {
	return result;
};
var handleState = function (context, name, args) {
	var handler = context['handle' + name.substring(0, 1).toUpperCase() + name.substring(1)];
	if (handler) {
		handler.apply(context, args);
	}
};

$.nette.ext('history', {
	init: function () {
		var snippetsExt;
		if (this.cache && (snippetsExt = $.nette.ext('snippets'))) {
			this.handleUI = function (domCache) {
				$.each(domCache, function () {
					snippetsExt.updateSnippet(this.id, this.html);
				});
			};
		}

		window.history.replaceState(this.state = {
			nette: true,
			href: window.location.href,
			title: document.title,
			ui: []
		}, document.title, window.location.href);
		$('[id^="snippet--"]').each(function () {
			var $el = $(this);
			this.state.ui.push({
				id: $el.attr('id'),
				html: $el.html()
			});
		});

		$(window).on('popstate.nette', $.proxy(function (e) {
			var state = e.originalEvent.state;
			if (window.history.ready || !state || !state.nette) return;
			if (this.cache && this.handleUI) {
				this.handleUI(state.ui);
			} else {
				$.nette.ajax({
					url: state.href,
					off: ['history']
				});
			}
		}, this));
	},
	start: function (xhr, settings) {
		if (xhr.readyState <= 0) return;

		if (!settings.nette) {
			this.href = null;
		} else if (!settings.nette.form) {
			this.href = settings.nette.ui.href;
		} else if (settings.nette.form.method == 'get') {
			this.href = settings.nette.ui.action || window.location.href;
		} else {
			this.href = null;
		}
		window.history.pushState(null, '', settings.url);
	},
	success: function (payload) {
		if (payload.redirect) {
			this.href = payload.redirect;
		}
		if (this.href === window.location.href) {
			this.href = null;
		}
		if (this.href && this.href != window.location.href) {
			window.history.replaceState(this.state = {
				nette: true,
				href: this.href,
				title: document.title,
				ui: payload.snippets
			}, document.title, this.href);
		}
		this.href = null;
	}
}, {
	state: null,
	href: null,
	cache: true
});

})(jQuery);
