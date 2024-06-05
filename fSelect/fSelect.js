/* fSelect 1.0.1 - https://github.com/mgibbs189/fselect */
//https://www.jqueryscript.net/form/jQuery-Plugin-For-Filterable-Multiple-Select-with-Checkboxes-fSelect.html

(function($) {

    String.prototype.unaccented = function() {
        var accent = [
            /[\300-\306]/g, /[\340-\346]/g, // A, a
            /[\310-\313]/g, /[\350-\353]/g, // E, e
            /[\314-\317]/g, /[\354-\357]/g, // I, i
            /[\322-\330]/g, /[\362-\370]/g, // O, o
            /[\331-\334]/g, /[\371-\374]/g, // U, u
            /[\321]/g, /[\361]/g, // N, n
            /[\307]/g, /[\347]/g, // C, c
        ];
        var noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

        var str = this;
        for (var i = 0; i < accent.length; i++) {
            str = str.replace(accent[i], noaccent[i]);
        }

        return str;
    }

    $.fn.fSelect = function(options) {
        if ('string' === typeof options) {
            var settings = options;
        }
        else {
            var settings = $.extend({
                placeholder: 'Select Music Taste',
                numDisplayed: 3,
                overflowText: '{n} selected',
                searchText: 'Search',
                noResultsText: 'No results found',
                showSearch: true,
                optionFormatter: false
            }, options);
        }


        /**
         * Constructor
         */
        function fSelect(select, settings) {
            this.$select = $(select);
            this.settings = settings;
            this.create();
        }


        /**
         * Prototype class
         */
        fSelect.prototype = {
            create: function() {
                this.idx = 0;
                this.optgroup = 0;
                this.selected = [].concat(this.$select.val()); // force an array
                this.settings.multiple = this.$select.is('[multiple]');

                var search_html = '';
                var no_results_html = '';
                var choices_html = this.buildOptions(this.$select);

                if (this.settings.showSearch) {
                    search_html = '<div class="fs-search"><input type="text" placeholder="' + this.settings.searchText + '" /></div>';
                }
                if ('' !== this.settings.noResultsText) {
                    no_results_html = '<div class="fs-no-results hidden">' + this.settings.noResultsText + '</div>';
                }

                var html = '<div class="fs-label-wrap"><div class="fs-label"></div><span onClick="clearDropdown(this)" class="fs-btnclear hide">Clear</span><span class="fs-arrow"></span></div>';
                //html += '<div class="fs-dropdown hidden">{search}{no-results}<div class="fs-options">' + choices_html + '</div></div>'; Edited by Vikas 30th July 2019
				html += '<div class="fs-dropdown hidden">{search}{no-results}<div class="fs-options">' + choices_html + '</div><button type="button">Apply</button></div>';
                html = html.replace('{search}', search_html);
                html = html.replace('{no-results}', no_results_html);

                this.$select.wrap('<div class="fs-wrap' + (this.settings.multiple ? ' multiple' : '') + '" tabindex="0" />');
                this.$select.addClass('hidden');
                this.$select.before(html);
                this.$wrap = this.$select.closest('.fs-wrap');
                this.$wrap.data('id', window.fSelect.num_items);
                window.fSelect.num_items++;

                this.reloadDropdownLabel();
            },

            reload: function() {
                this.destroy();
                this.create(); 
            },

            destroy: function() {
                this.$wrap.find('.fs-label-wrap').remove();
                this.$wrap.find('.fs-dropdown').remove();
                this.$select.unwrap().removeClass('hidden');
            },

            buildOptions: function($element) {
                var $this = this;

                var choices = '';
                $element.children().each(function(i, el) {
                    var $el = $(el);

                    if ('optgroup' == $el.prop('nodeName').toLowerCase()) {
                        choices += '<div class="fs-optgroup-label" data-group="' + $this.optgroup + '">' + $el.prop('label') + '</div>';
                        choices += $this.buildOptions($el);
                        $this.optgroup++;
                    }
                    else {
                        var val = $el.prop('value');
                        var classes = $el.attr('class');
                        classes = ('undefined' !== typeof classes) ? ' ' + classes : '';

                        // exclude the first option in multi-select mode
                        if (0 < $this.idx || '' != val || ! $this.settings.multiple) {
                            var disabled = $el.is(':disabled') ? ' disabled' : '';
                            var selected = -1 < $.inArray(val, $this.selected) ? ' selected' : '';
                            var group = ' g' + $this.optgroup;
                            var row = '<div class="fs-option' + selected + disabled + group + classes + '" data-value="' + val + '" data-index="' + $this.idx + '"><span class="fs-checkbox"><i></i></span><div class="fs-option-label">' + $el.html() + '</div></div>';

                            if ('function' === typeof $this.settings.optionFormatter) {
                                row = $this.settings.optionFormatter(row);
                            }

                            choices += row;
                            $this.idx++;
                        }
                    }
                });
                
                return choices;
            },

            reloadDropdownLabel: function() {
                var settings = this.settings;
                var labelText = [];

                this.$wrap.find('.fs-option.selected').each(function(i, el) {
                    labelText.push($(el).find('.fs-option-label').html());
                });

                if (labelText.length < 1) {
                    var selectedDropdownId = this.$wrap.find('select').attr("id");
                    console.log("selectedDropdownId: "+selectedDropdownId);
                    if(selectedDropdownId == 'compare_industry_cv_id')
                    {
                        labelText = 'Select Industry';
                        $(".fs-wrap.multiple .fs-checkbox").css("display","none");
                        $(".fs-wrap.multiple .fs-option").css("padding-left","5px");
                    }
                    else if(selectedDropdownId == 'compare_sub_industry_cv_id')
                    {
                        labelText = 'Select Sub Industry';
                        $(".fs-wrap.multiple .fs-checkbox").css("display","none");
                        $(".fs-wrap.multiple .fs-option").css("padding-left","5px");                     
                    }
                    else if(selectedDropdownId == 'compare_brand_cv_id')
                    {
                        labelText = 'Select CV';
                        $(".fs-wrap.multiple .fs-checkbox").css("display","none");
                        $(".fs-wrap.multiple .fs-option").css("padding-left","5px");
                    }
                    else
                    {
                        labelText = settings.placeholder;
                    }
                                      
                }
                else if (labelText.length > settings.numDisplayed) {
                    labelText = settings.overflowText.replace('{n}', labelText.length);
                }
                else {
                    labelText = labelText.join(', ');
                }

                this.$wrap.find('.fs-label').html(labelText);
                this.$wrap.toggleClass('fs-default', labelText === settings.placeholder);
            }
        }


        /**
         * Loop through each matching element
         */
        return this.each(function() {
            var data = $(this).data('fSelect');

            if (!data) {
                data = new fSelect(this, settings);
                $(this).data('fSelect', data);
            }

            if ('string' === typeof settings) {
                data[settings]();
            }
        });
    }


    /**
     * Events
     */
    window.fSelect = {
        'num_items': 0,
        'active_id': null,
        'active_el': null,
        'last_choice': null,
        'idx': -1
    };

    $(document).on('click', '.fs-option:not(.hidden, .disabled)', function(e) {
        var $wrap = $(this).closest('.fs-wrap');
        var $select = $wrap.find('select');
        var do_close = false;
        var selectedDropdownId = $wrap.find('select').attr("id");
        console.log("selectedDropdownId: "+selectedDropdownId);

        // prevent selections
        if ($wrap.hasClass('fs-disabled')) {
            return;
        }

        if ($wrap.hasClass('multiple')) {
            var selected = [];
            // shift + click support
            if (e.shiftKey && null != window.fSelect.last_choice) {
                var current_choice = parseInt($(this).attr('data-index'));
                var addOrRemove = ! $(this).hasClass('selected');
                var min = Math.min(window.fSelect.last_choice, current_choice);
                var max = Math.max(window.fSelect.last_choice, current_choice);

                for (i = min; i <= max; i++) {
                    $wrap.find('.fs-option[data-index='+ i +']')
                        .not('.hidden, .disabled')
                        .each(function() {
                            $(this).toggleClass('selected', addOrRemove);
                        });
                }
            }
            else {
                window.fSelect.last_choice = parseInt($(this).attr('data-index'));
                $(this).toggleClass('selected');
            }

            $wrap.find('.fs-option.selected').each(function(i, el) {
                selected.push($(el).attr('data-value'));
            });
        }
        else {
            var selected = $(this).attr('data-value');
            $wrap.find('.fs-option').removeClass('selected');
            $(this).addClass('selected');
            do_close = true;
        }
        //console.log('selected:'+selected.length);
        /* if(selectedDropdownId == 'compare_industry_cv_id' || selectedDropdownId == 'compare_sub_industry_cv_id' || selectedDropdownId == 'compare_brand_cv_id')
        {
            if(selected.length==1)
            {
                do_close = true;
            }
            if(selectedDropdownId == 'compare_industry_cv_id')
            {
                //console.log("in if selected"+selected+'----------------------------'+atob(selected.split('$_$')[0]))+'_'+atob(selected.split('$_$')[1]);
                if(selected !='')
                {
                    $("#compare_industry_cv_id_val").val(selected);
                    $("#compare_industry_dropdown").find(".fs-btnclear").removeClass("hide");
                    $("#compare_option").val('industry_cv');
                    var actionUrl = $("#compare_industry_form").val();
                    $("#modal_compare").find("form").attr("action",actionUrl);

                    //$("#compare_cv_dropdown").find(".fs-wrap").css("pointer-events","none");
                    //$("#compare_cv_dropdown").css("cursor","not-allowed");
                    //$("#compare_sub_industry_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeAttr("selected");
                    if($("#compare_sub_industry_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").hasClass(atob(selected.split('$_$')[0])+'_'+atob(selected.split('$_$')[1])))
                    {
                        
                        $("#compare_sub_industry_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeAttr("selected");
                        $("#compare_sub_industry_dropdown").find(".fs-wrap").removeAttr("style");
                        $("#compare_sub_industry_dropdown").removeAttr("style");
                        $("#compare_sub_industry_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeClass("hide");
                        $("#compare_sub_industry_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").not($("#compare_sub_industry_dropdown").find(".fs-dropdown").find(".fs-options").find("."+atob(selected.split('$_$')[0])+'_'+atob(selected.split('$_$')[1]))).addClass("hide");
                        
                    }
                    else
                    {
                        $("#compare_sub_industry_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeAttr("selected");
                        $("#compare_sub_industry_dropdown").find(".fs-wrap").css("pointer-events","none");
                        $("#compare_sub_industry_dropdown").css("cursor","not-allowed");
                        $("#compare_sub_industry_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeClass("hide");
                    }
                    
                    if($("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").hasClass('ind_'+atob(selected.split('$_$')[0])+'_'+atob(selected.split('$_$')[1])))
                    {
                        console.log('ind_'+atob(selected.split('$_$')[0])+'_'+atob(selected.split('$_$')[1]));
                        $("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeAttr("selected");
                        $("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeClass("hide");
                        $("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").not($("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".ind_"+atob(selected.split('$_$')[0])+'_'+atob(selected.split('$_$')[1]))).addClass("hide");
                        
                    }
                    else
                    {
                        $("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeAttr("selected");
                        $("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeClass("hide");
                    }
                    $("#compare_btn").removeAttr("disabled");
                }
                else
                {
                    $("#compare_industry_cv_id_val").val('');
                    $("#compare_sub_industry_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeAttr("selected");
                    $("#compare_sub_industry_dropdown").find(".fs-wrap").css("pointer-events","none");
                    $("#compare_sub_industry_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeClass("hide");
                    if($("#compare_brand_cv_id_val").val() == '')
                    {
                        $("#compare_btn").attr("disabled","true");
                    }
                }
            }
            else if(selectedDropdownId == 'compare_sub_industry_cv_id')
            {
                if(selected != '')
                {
                    $("#compare_sub_industry_cv_id_val").val(selected);
                    $("#compare_sub_industry_dropdown").find(".fs-btnclear").removeClass("hide");
                    $("#compare_option").val('sub_industry_cv');
                    var actionUrl = $("#compare_sub_industry_form").val();
                    $("#modal_compare").find("form").attr("action",actionUrl);
                    if($("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").hasClass('sind_'+atob(selected.split('$_$')[0])+'_'+atob(selected.split('$_$')[1])))
                    {
                        console.log('sind_'+atob(selected.split('$_$')[0])+'_'+atob(selected.split('$_$')[1]));
                        $("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeAttr("selected");
                        $("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeClass("hide");
                        $("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").not($("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".sind_"+atob(selected.split('$_$')[0])+'_'+atob(selected.split('$_$')[1]))).addClass("hide");
                        
                    }
                    else
                    {
                        $("#compare_sub_industry_cv_id_val").val('');
                        $("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeAttr("selected");
                        $("#compare_cv_dropdown").find(".fs-dropdown").find(".fs-options").find(".fs-option").removeClass("hide");
                    }
                }
            }
            else if(selectedDropdownId == 'compare_brand_cv_id')
            {
                if(selected != '')
                {
                    $("#compare_brand_cv_id_val").val(selected);
                    $("#compare_btn").removeAttr("disabled");
                    $("#compare_cv_dropdown").find(".fs-btnclear").removeClass("hide");
                    $("#compare_option").val('barnd_cv');
                    var actionUrl = $("#compare_cv_form").val();
                    $("#modal_compare").find("form").attr("action",actionUrl);         
                }
                else
                {
                    $("#compare_brand_cv_id_val").val('');
                    if($("#compare_industry_cv_id_val").val() == '')
                    {
                        $("#compare_btn").attr("disabled","true");
                        $("#compare_option").val('');
                    }
                }
                
            }
        }
        else */ if(selectedDropdownId == 'add_cv_id_in_best_audio_brands')
        {
            $("#add_cv_id_in_best_audio_brands_val").val(selected);
            var statusTypeVal = $("#status_type").val();
            //console.log(statusTypeVal+"|||"+statusTypeVal.split("_")[0]+"****"+statusTypeVal.split("_")[1]);
            if(statusTypeVal.split("_")[1] == 'replace')
            {
                var srNo = $("#tbl_id_"+statusTypeVal.split("_")[0]).val();
                //console.log("#cv_year_"+srNo);
                $("#cv_id_"+srNo).val($("#add_cv_id_in_best_audio_brands_val").val().split("$_$")[0]);
                $("#cv_name_"+srNo).val($("#add_cv_id_in_best_audio_brands_val").val().split("$_$")[1]);
                var cvName = atob($("#add_cv_id_in_best_audio_brands_val").val().split("$_$")[1]);
                var cvYear = atob($("#cv_year_"+srNo).val());
                var oldCvName = atob($("#old_cv_name_"+srNo).val());
                var warrningMsg = "Are you sure you want to replace<br>Brand <span style='font-size:18px; font-weight:bold;'>"+cvName+" "+cvYear+"</span> with Brand <span style='font-size:18px; font-weight:bold;'>"+oldCvName+"</span> <br>at Rank <span style='font-size:18px; font-weight:bold;'>"+srNo+"</span>?";
                $(".warrningMsg").append("<p style='margin-top:15px; font-size:14px; text-align:center;'>"+warrningMsg+"</p>");
                $("#abepnDataHoldr").removeClass("hide");
                /* $(".warrningMsg").removeClass("hide");
                $("#addReplaceDisableInBestAudioBrands").find(".btn").removeClass("hide"); */
            }
            else
            {
                var srNo = $("#tbl_id_"+statusTypeVal.split("_")[0]).val();
                $("#cv_id_"+srNo).val($("#add_cv_id_in_best_audio_brands_val").val().split("$_$")[0]);
                $("#cv_name_"+srNo).val($("#add_cv_id_in_best_audio_brands_val").val().split("$_$")[1]);
                var cvName = atob($("#add_cv_id_in_best_audio_brands_val").val().split("$_$")[1]);
                var cvYear = atob($("#cv_year_"+srNo).val());
                var warrningMsg = "Do you want to add<br>Brand <span style='font-size:18px; font-weight:bold;'>"+cvName+" "+cvYear+"</span><br>at Rank <span style='font-size:18px; font-weight:bold;'>"+srNo+"</span>?";
                $(".warrningMsg").append("<p style='margin-top:15px; font-size:14px; text-align:center;'>"+warrningMsg+"</p>");
                $("#abepnDataHoldr").removeClass("hide");
                /* $(".warrningMsg").removeClass("hide");
                $("#addReplaceDisableInBestAudioBrands").find(".btn").addClass("hide"); */
            }                
        }
        else if(selectedDropdownId == 'add_brand_in_social_blade_sync_process')
        {
            if(selected !=0 && selected!='')
            {
                $(".social_media_name option").remove();
                $(".social_media_name").append('<option value="0">Select Channel Name</option>');
                $("#sb_btn").attr("disabled",'true');
                $(".btnPlus").addClass("hide");
                var chnUrl = $("#getchnUrl").val()+'/'+selected;
                $.ajax({
                    type: "GET",
                    url: chnUrl,
                    data: "",
                    success: function(data) {
                        if(data != '' && data != undefined)
                        {
                            console.log("chn data",data);
                            var chnlDataArr = Object.entries(data);
                            var chnlDataArr = Object.entries(data);
                            console.log(chnlDataArr, chnlDataArr.length);
                            var ytHtmlData = '';
                            var igHtmlData = '';
                            var ttHtmlData = '';
                            var twtHtmlData = '';
                            for(var i=0; i<chnlDataArr.length; i++)
                            {
                                console.log(chnlDataArr[i][0], chnlDataArr[i][1]);
                                if(chnlDataArr[i][0].split('-')[0] == 1)
                                {
                                    ytHtmlData += '<option value="'+chnlDataArr[i][1]+'">'+chnlDataArr[i][1]+'</option>';
                                }
                                if(chnlDataArr[i][0].split('-')[0] == 2)
                                {
                                    igHtmlData += '<option value="'+chnlDataArr[i][1]+'">'+chnlDataArr[i][1]+'</option>';
                                }
                                if(chnlDataArr[i][0].split('-')[0] == 3)
                                {
                                    ttHtmlData += '<option value="'+chnlDataArr[i][1]+'">'+chnlDataArr[i][1]+'</option>';
                                }
                                if(chnlDataArr[i][0].split('-')[0] == 4)
                                {
                                    twtHtmlData += '<option value="'+chnlDataArr[i][1]+'">'+chnlDataArr[i][1]+'</option>';
                                }
                                //console.log(ytHtmlData);console.log(igHtmlData);console.log(ttHtmlData);console.log(twtHtmlData);
                            }
                            if(ytHtmlData !='')
                            {
                                $("#yt_social_media_name_0").append(ytHtmlData);
                            }
                            if(igHtmlData !='')
                            {
                                $("#ig_social_media_name_0").append(igHtmlData);
                            }
                            if(ttHtmlData !='')
                            {
                                $("#tt_social_media_name_0").append(ttHtmlData);
                            }
                            if(twtHtmlData !='')
                            {
                                $("#twt_social_media_name_0").append(twtHtmlData);
                            }
                        }                        
                    },
                    complete: function(data){  
                        //console.log("b11Avg"+b14Avg);
                        if(data != '' && data != undefined)
                        {
                            $("#channel_name_holder").removeClass("hide");
                        }
                    }                
                });               
            }
            else
            {
                //$("#social_media_name_holder").addClass("hide"); 
                $("#channel_name_holder").addClass("hide");   
                $(".social_media_name option").remove();
                $(".social_media_name").append('<option value="0">Select Channel Name</option>');
                $("#sb_btn").attr("disabled",'true');            
            }              
        }
        else if(selectedDropdownId == 'cv_ind_sind_name')
        {
            //console.log(atob(selected.split('_')[1]));
            $("#cv_ind_sind_name_val").val(selected);
            $("#radarChartImg1").val("");
            $("#radarChartImg2").val("");
            $("#radarChartImg_1a").addClass("hide");
            $("#radarChartImg_2a").addClass("hide");
            $("#radarChartImg_1a").attr("href","#");
            $("#radarChartImg_2a").attr("href","#");
        }
        else if(selectedDropdownId == 'industry_name'){


            //$("#modal_overlay").removeClass("hide");
            // $("#filterAndSortByDiv").append(getLoader());
            //$("#modal_overlay").append(getLoader());
            $('#industry_name').val(selected);
            browseSnapshotsSelect("industry")

        }else if(selectedDropdownId == 'sub_industry_name'){

            $('#sub_industry_name').val(selected);
            browseSnapshotsSelect("subindustry")

        }
       /*  else if(selectedDropdownId == 'AtoZ_sort_by'){
            $('#AtoZ_sort_by').val(selected);
            browseSnapshotsSelect("atozSnapshotFilter")

        } */
        else
        {
            if(selected.length==3)
            {
                $(".fs-option").not((".fs-option.selected")).addClass("disabled");
            }
            else
            {
                $(".fs-option").removeClass("disabled");
            }
            $("#cv_music_taste_name_ids").val(selected);
        }
        $select.val(selected);
        $select.fSelect('reloadDropdownLabel');
        $select.change();

        // fire an event
        $(document).trigger('fs:changed', $wrap);

        if (do_close) {
            closeDropdown($wrap);
        }
    });

    $(document).on('keyup', '.fs-search input', function(e) {
        if (40 == e.which) { // down
            $(this).blur();
            return;
        }

        var $wrap = $(this).closest('.fs-wrap');
        var matchOperators = /[|\\{}()[\]^$+*?.]/g;
        var keywords = $(this).val().replace(matchOperators, '\\$&');

        $wrap.find('.fs-option, .fs-optgroup-label').removeClass('hidden');

        if ('' != keywords) {
            $wrap.find('.fs-option').each(function() {
                var regex = new RegExp(keywords.unaccented(), 'gi');
                var formatedValue = $(this).find('.fs-option-label').text().unaccented();

                if (null === formatedValue.match(regex)) {
                    $(this).addClass('hidden');
                }
            });
            // commented by Gophygital to avoid apply hidden class to fs-optgroup label
            /* $wrap.find('.fs-optgroup-label').each(function() {
                var group = $(this).attr('data-group');
                var num_visible = $(this).closest('.fs-options').find('.fs-option.g' + group + ':not(.hidden)').length;
                if (num_visible < 1) {
                    $(this).addClass('hidden');
                }
            }); */
        }

        setIndexes($wrap);
        checkNoResults($wrap);
    });

    $(document).on('click', function(e) {
        var $el = $(e.target);
        var $wrap = $el.closest('.fs-wrap');

        if (0 < $wrap.length) {

            // user clicked another fSelect box
            if ($wrap.data('id') !== window.fSelect.active_id) {
                closeDropdown();
            }

            // fSelect box was toggled
            if ($el.hasClass('fs-label') || $el.hasClass('fs-arrow')) {
                var is_hidden = $wrap.find('.fs-dropdown').hasClass('hidden');

                if (is_hidden) {
                    openDropdown($wrap);
                }
                else {
                    closeDropdown($wrap);
                }
            }
        }
        // clicked outside, close all fSelect boxes
        else {
            closeDropdown();
        }
    });

    $(document).on('keydown', function(e) {
        var $wrap = window.fSelect.active_el;
        var $target = $(e.target);

        // toggle the dropdown on space
        if ($target.hasClass('fs-wrap')) {
            if (32 == e.which || 13 == e.which) {
                e.preventDefault();
                $target.find('.fs-label').trigger('click');
                return;
            }
        }
        // preserve spaces during search
        else if (0 < $target.closest('.fs-search').length) {
            if (32 == e.which) {
                return;
            }
        }
        else if (null === $wrap) {
            return;
        }

        if (38 == e.which) { // up
            e.preventDefault();

            $wrap.find('.fs-option.hl').removeClass('hl');

            var $current = $wrap.find('.fs-option[data-index=' + window.fSelect.idx + ']');
            var $prev = $current.prevAll('.fs-option:not(.hidden, .disabled)');

            if ($prev.length > 0) {
                window.fSelect.idx = parseInt($prev.attr('data-index'));
                $wrap.find('.fs-option[data-index=' + window.fSelect.idx + ']').addClass('hl');
                setScroll($wrap);
            }
            else {
                window.fSelect.idx = -1;
                $wrap.find('.fs-search input').focus();
            }
        }
        else if (40 == e.which) { // down
            e.preventDefault();

            var $current = $wrap.find('.fs-option[data-index=' + window.fSelect.idx + ']');
            if ($current.length < 1) {
                var $next = $wrap.find('.fs-option:not(.hidden, .disabled):first');
            }
            else {
                var $next = $current.nextAll('.fs-option:not(.hidden, .disabled)');
            }

            if ($next.length > 0) {
                window.fSelect.idx = parseInt($next.attr('data-index'));
                $wrap.find('.fs-option.hl').removeClass('hl');
                $wrap.find('.fs-option[data-index=' + window.fSelect.idx + ']').addClass('hl');
                setScroll($wrap);
            }
        }
        else if (32 == e.which || 13 == e.which) { // space, enter
            e.preventDefault();

            $wrap.find('.fs-option.hl').click();
        }
        else if (27 == e.which) { // esc
            closeDropdown($wrap);
        }
    });

    function checkNoResults($wrap) {
        var addOrRemove = $wrap.find('.fs-option:not(.hidden)').length > 0;
        $wrap.find('.fs-no-results').toggleClass('hidden', addOrRemove);
    }

    function setIndexes($wrap) {
        $wrap.find('.fs-option.hl').removeClass('hl');
        $wrap.find('.fs-search input').focus();
        window.fSelect.idx = -1;
    }

    function setScroll($wrap) {
        var $container = $wrap.find('.fs-options');
        var $selected = $wrap.find('.fs-option.hl');

        var itemMin = $selected.offset().top + $container.scrollTop();
        var itemMax = itemMin + $selected.outerHeight();
        var containerMin = $container.offset().top + $container.scrollTop();
        var containerMax = containerMin + $container.outerHeight();

        if (itemMax > containerMax) { // scroll down
            var to = $container.scrollTop() + itemMax - containerMax;
            $container.scrollTop(to);
        }
        else if (itemMin < containerMin) { // scroll up
            var to = $container.scrollTop() - containerMin - itemMin;
            $container.scrollTop(to);
        }
    }

    function openDropdown($wrap) {
        window.fSelect.active_el = $wrap;
        window.fSelect.active_id = $wrap.data('id');
        window.fSelect.initial_values = $wrap.find('select').val();
        $(document).trigger('fs:opened', $wrap);
        $wrap.find('.fs-dropdown').removeClass('hidden');
        $wrap.addClass('fs-open');
        setIndexes($wrap);
        checkNoResults($wrap);
    }

    function closeDropdown($wrap) {
        if ('undefined' == typeof $wrap && null != window.fSelect.active_el) {
            $wrap = window.fSelect.active_el;
        }
        if ('undefined' !== typeof $wrap) {
            // only trigger if the values have changed
            var initial_values = window.fSelect.initial_values;
            var current_values = $wrap.find('select').val();
            if (JSON.stringify(initial_values) != JSON.stringify(current_values)) {
                $(document).trigger('fs:closed', $wrap);
            }
        }

        $('.fs-wrap').removeClass('fs-open');
        $('.fs-dropdown').addClass('hidden');
        window.fSelect.active_el = null;
        window.fSelect.active_id = null;
        window.fSelect.last_choice = null;
    }

})(jQuery);
