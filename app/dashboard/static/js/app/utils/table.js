/*! Kernel CI Dashboard | Licensed under the GNU GPL v3 (or later) */
define([
    'jquery',
    'sprintf',
    'datatables',
    'datatables.bootstrap'
], function($) {
    'use strict';
    var gMenuFmt,
        gSearchLanguage,
        gTable,
        gTableDom;

    gTableDom = '<"row"<"col-xs-12 col-sm-12 col-md-4 col-lg-4"' +
            '<"length-menu"l>>' +
            '<"col-xs-12 col-sm-12 col-md-4 col-lg-4"<"table-process">>' +
            '<"col-xs-12 col-sm-12 col-md-4 col-lg-4"f>r' +
            '<"col-xs-12 col-sm-12 col-md-12 col-lg-12"t>>' +
            '<"row paging"<"col-xs-12 col-sm-12 col-md-6 col-lg-6"i>' +
            '<"col-xs-12 col-sm-12 col-md-6 col-lg-6"p>>';

    gSearchLanguage = '<div id="search-area" class="input-group pull-right">' +
        '<span class="input-group-addon">' +
        '<i class="fa fa-search"></i></span>_INPUT_</div>';

    gMenuFmt = '_MENU_&nbsp;<strong>%s</strong>';

    /**
     * Remove the focus from the element that triggers the event.
     * Apply a blur() to the triggering element.
     *
     * @private
     * @param {Event} event: The event triggering this function.
    **/
    function removeFocus(event) {
        var target;

        target = event.target || event.srcElement;
        if (event.keyCode === 27) {
            target.blur();
        }
    }

    var kciTable = {
        tableId: null,
        tableLoadingDivId: null,
        tableDivId: null,
        disableSearch: false,
        tableNode: null,
        tableLoadingNode: null,
        tableDivNode: null,
        table: null,
        oldSearch: null,
        inputNode: null,
        selectNode: null,
        _noIdURL: false,
        _rowURL: '/build/%(job)s/kernel/%(kernel)s/',
        _rowURLElements: ['job', 'kernel'],
        _clickFunction: null,
        _drawFunction: null,
        _lengthMenu: [25, 50, 75, 100],
        _order: [1, 'desc'],
        _dom: gTableDom,
        _data: null,
        _columns: null,
        _paging: true,
        _info: true,
        _languageLengthMenu:
            '_MENU_&nbsp;<strong>reports per page</strong>',
        _languageZeroRecords: '<strong>No data found.</strong>'
    };

    kciTable.settings = function() {
        return {
            language: {
                lengthMenu: this._languageLengthMenu,
                zeroRecords: this._languageZeroRecords,
                search: gSearchLanguage,
                searchPlaceholder: 'Filter the results'
            },
            search: {
                regex: true,
                smart: true
            },
            data: this._data,
            columns: this._columns,
            paging: this._paging,
            info: this._info,
            order: this._order,
            dom: this._dom,
            lengthMenu: this._lengthMenu,
            deferRender: true,
            ordering: true,
            stateSave: true,
            stateDuration: -1,
            processing: false
        };
    };

    kciTable.paging = function(value) {
        if (value !== undefined) {
            this._paging = Boolean(value);
            return this;
        }
        return this._paging;
    };

    kciTable.info = function(value) {
        if (value !== undefined) {
            this._info = Boolean(value);
            return this;
        }
        return this._info;
    };

    kciTable.setup = function() {
        if (this.tableId) {
            this.tableNode = document.getElementById(this.tableId);

            if (!this.tableNode) {
                throw 'No table ID DOM element found';
            }
        } else {
            throw 'No table ID defined';
        }

        if (this.tableLoadingDivId) {
            this.tableLoadingNode =
                document.getElementById(this.tableLoadingDivId);
        }

        if (this.tableDivId) {
            this.tableDivNode = document.getElementById(this.tableDivId);

            if (this.tableDivNode) {
                this.inputNode =
                    this.tableDivNode.querySelector('input.input-sm');
                this.selectNode =
                    this.tableDivNode.querySelector('select.input-sm');
            }
        }

        return this;
    };

    kciTable.languageZeroRecords = function(value) {
        if (value !== null && value !== undefined) {
            this._languageZeroRecords = value;
            return this;
        }
        return this._languageZeroRecords;
    };

    kciTable.languageLengthMenu = function(value) {
        if (value !== null && value !== undefined) {
            this._languageLengthMenu = sprintf(gMenuFmt, value);
            return this;
        }
        return this._languageLengthMenu;
    };

    kciTable.rowURL = function(value) {
        if (value !== null && value !== undefined) {
            this._rowURL = value;
            return this;
        }
        return this._rowURL;
    };

    kciTable.rowURLElements = function(value) {
        if (value !== null && value !== undefined) {
            this._rowURLElements = value;
            return this;
        }
        return this._rowURLElements;
    };

    kciTable.order = function(value) {
        if (value !== null && value !== undefined) {
            this._order = value;
            return this;
        }
        return this._order;
    };

    kciTable.data = function(value) {
        if (value !== null && value !== undefined) {
            this._data = value;
            return this;
        }
        return this._data;
    };

    kciTable.columns = function(value) {
        if (value !== null && value !== undefined) {
            this._columns = value;
            return this;
        }
        return this._columns;
    };

    /**
     * Control whetever the link for the row click event should have an
     * '_id=' value appended.
     *
     * @param {Boolean} value: If the row link should have an ID or not.
    **/
    kciTable.noIdURL = function(value) {
        if (value !== undefined) {
            this._noIdURL = Boolean(value);
            return this;
        }
        return this._noIdURL;
    };

    kciTable.dom = function(value) {
        if (value !== null && value !== undefined) {
            this._dom = value;
            return this;
        }
        return this._dom;
    };

    /**
     * Get or set the length menu.
     * This is the menu with how many rows to show in the table.
     *
     * @param {Array} value: The array with the number of rows to show.
    **/
    kciTable.lengthMenu = function(value) {
        if (value !== null && value !== undefined) {
            this._lengthMenu = value;
            return this;
        }
        return this._lengthMenu;
    };

    /**
     * Get or set the row click function.
     * This is the function to be called when a row gets clicked.
     *
     * @param {Function} value: The function to associate with the click event.
    **/
    kciTable.clickFunction = function(value) {
        if (value !== null && value !== undefined) {
            this._clickFunction = value;
            return this;
        }
        return this._clickFunction;
    };

    /**
     * Perform a search on the table.
     * A draw() event will be fired.
     *
     * @param {String} value: The search string to perform.
    **/
    kciTable.search = function(value) {
        if (this.inputNode && this.inputNode.disabled) {
            this.inputNode.removeAttribute('disabled');
        }

        if (value && value.length > 0) {
            this.oldSearch = null;
            this.table.search(value, true, true).draw();
        }

        return this;
    };

    /**
     * Change the length of the tables, showing or hiding rows.
     * A draw() event will be fired.
     *
     * @param {String} value: The number of rows to show.
    **/
    kciTable.pageLen = function(value) {
        var len;

        if (value && value.length > 0) {
            len = Number(value);
            if (isNaN(len)) {
                len = this._lengthMenu[0];
            }
            this.table.page.len(len).draw();
        }

        return this;
    };

    /**
     * Associate a new function on the 'draw' event.
     * This is fired whenevr the table draw() event has been completed.
     *
     * @param {Function} func: The function to associate.
    **/
    kciTable.addDrawEvent = function(func) {
        if (func) {
            this.table.on('draw.dt', func);
        }
        return this;
    };

    /**
     * Add new rows to the table, updating and refreshing it.
     *
     * @param {object} value: The data that the rows will be built on.
     * It must be of the same type and with the same structure of the initial
     * data with which the table was populated.
    **/
    kciTable.addRows = function(value) {
        this.table.rows.add(value).draw();
    };

    /**
     * Draw the actual table and bind functions/events.
    **/
    kciTable.draw = function() {
        var settings,
            that;

        that = this;
        settings = that.settings();

        function _observeMutations() {
            var observer,
                observerConfig,
                target;

            observer = new MutationObserver(function(events) {
                events.forEach(function(event) {
                    target = event.target || event.srcElement;
                    if (target === that.inputNode &&
                            event.attributeName === 'disabled') {

                        if (that.oldSearch) {
                            that.table
                                .search(that.oldSearch, true, true)
                                .draw();
                            that.oldSearch = null;
                        }
                    }
                });
                observer.disconnect();
            });
            observerConfig = {
                attributes: true,
                attributeOldValue: true
            };
            observer.observe(that.inputNode, observerConfig);
        }

        settings.initComplete = function() {
            if (that.tableLoadingNode) {
                $(that.tableLoadingNode).remove();
            }
            if (that.tableDivNode) {
                $(that.tableDivNode).fadeIn('slow', 'linear');
            }
        };

        settings.stateLoadParams = function(s, d) {
            if (that.disableSearch && d.search.search.length > 0) {
                that.oldSearch = d.search.search;
                d.search.search = '';
            }
        };

        that.table = $(that.tableNode).DataTable(settings);

        if (that._drawFunction) {
            that.table.on('draw.dt', that._drawFunction);
        }

        if (that.inputNode) {
            // Remove focus from input when Esc is pressed.
            that.inputNode.addEventListener('keyup', removeFocus);

            // Disable search box.
            if (that.disableSearch) {
                that.inputNode.setAttribute('disabled', true);
            }
        }

        if (that.selectNode) {
            // Remove focus from the table length selection on Esc.
            that.selectNode.addEventListener('keyup', removeFocus);
        }

        if (that._clickFunction) {
            that.table.on('click', 'tbody tr', that._clickFunction);
        } else {
            that.table.on('click', 'tbody tr', function() {
                var location,
                    rowData,
                    substitutions;

                rowData = that.table.row(this).data();
                location = '#';
                substitutions = {};

                if (rowData) {
                    that._rowURLElements.forEach(function(value) {
                        substitutions[value] = rowData[value] || null;
                    });

                    location = sprintf(that._rowURL, substitutions);
                    if (!that._noIdURL && rowData._id) {
                        location += '?_id=' + rowData._id.$oid;
                    }
                }
                window.location = location;
            });
        }

        that.table.on('search.dt', function() {
            if (that.disableSearch && that.oldSearch !== null) {
                if (window.MutationObserver) {
                    if (that.inputNode.getAttribute('disabled')) {
                        _observeMutations();
                    }
                } else {
                    // No support for MutationObserver.
                    that.table.search(that.oldSearch, true, true).draw();
                }
            }
        });

        return this;
    };

    /**
     * Factory to create new table elements.
     *
     * @param {object} settings: The settings associated with the table.
    **/
    gTable = function(settings) {
        var key,
            newTable;

        newTable = Object.create(kciTable);

        if (settings) {
            for (key in settings) {
                if (settings.hasOwnProperty(key)) {
                    newTable[key] = settings[key];
                }
            }
        } else {
            throw 'No settings found';
        }

        return newTable.setup();
    };

    return gTable;
});
