class Katsuyou {

    constructor() {

        const self = this;

        this.isMobile = this.isMobile();
        this.tutorial = true;
        this.disabled = true;
        this.playing = false;
        this.history = [];
        this.score = { success : 0, error : 0 };

        // Init conjugation
        this.conjugator = new(JsLingua.getService("Morpho", 'jpn'))();
        this.conjugations = this.conjugator.getForms();

        // Load settings
        $.post( Routing.generate('load'), data => self.init(data) ).fail( err => console.error(err) );

        // Init elements
        this.initSessionElements();
        this.initUserInputs();
        this.initSpeakBtn();
        this.initTimer();
        this.initTutorial();

    }

    // Init loaded data / settings ____________________________________________________________________________________________________________
    init(data) {
        this.initVerbs( data.verbs );
        this.initTenses( data.tenses );
        this.initSettings( data.settings );
        this.initSettingsInputs();
        this.initTimer();
        this.initVoice();
        this.onLoad();
    }

    initTenses(tenses) {

        this.tenses = tenses, this.tensesEl = $('#tenses-settings'), this.tensesTpl = $('#tenses-template');
        for( let t in tenses ) {
            this.tenses[t].conjugation = this.conjugations[t];
            this.tensesEl.append(
                this.tensesTpl.html()
                .replace('#value#', t)
                .replace('#label#', tenses[t].label)
            );
        }

    }
 
    initVerbs(verbs) {

        this.verbs = {}, this.verbsEl = $('#verbs-settings'), this.verbsTpl = $('#verbs-template');
        for( let v in  verbs ) {
            const verb = verbs[v];
            this.verbs[verb.id] = verb;
            this.verbsEl.append($(
                this.verbsTpl.html()
                .replace('#id#', verb.id)
                .replace('#id#', verb.id)
                .replace('#word#', verb.word)
                .replace('#furigana#', verb.reading)
                .replace('#romaji#', verb.romaji)
                .replace('#type#', verb.type)
                .replace('#definition#', '「 ' + verb.definition + ' 」')
            ));
        }

        const self = this;

        this.searchEl = $('#search'), this.search = "";
        this.searchEl.on('keyup', function() {
            self.search = $(this).val();
            self.searchVerb();
        });

        this.searchTypeEl = $('#search-type'), this.searchType = false;
        this.searchTypeEl.on('change', function() {
            const type = $(this).val();
            type == "false" ? self.searchType = false : self.searchType = type;
            self.searchVerb();
        });

        this.searchSelectedEl = $('#search-selected'), this.searchSelected = false;
        this.searchSelectedEl.on('change', function() {
            const selected = $(this).val();
            selected == "false" ? self.searchSelected = false : self.searchSelected = selected;
            self.searchVerb();
        });

    }

    searchVerb() {

        const search = new RegExp(this.search.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'), "g");

        for( let v in this.verbs ) {

            const verb = this.verbs[v], verbEl = $('.verb-item[data-id="' + verb.id + '"]');

            if( this.searchType && verb.type != this.searchType ) {
                verbEl.hide();
                continue;
            }

            if( this.searchSelected) {
                const isSelected = this.settings.verbs.includes(parseInt(v));
                if( this.searchSelected == 'selected' && !isSelected || this.searchSelected == 'unselected' && isSelected ) {
                    verbEl.hide();
                    continue;
                }
            }

            if( this.search == "" ) {
                verbEl.show();
                continue;
            }
            
            !verb.romaji.match(search) && !verb.word.match(search) && !verb.reading.match(search) && !verb.definition.match(search) ? verbEl.hide() : verbEl.show();
            
        }

    }

    initSettings(settings) {

        this.settings = settings;

        for( let s in settings ) {
            switch(s) {

                case 'tenses' :
                case 'verbs' : {
                    for( let i = 0; i < settings[s].length; i++ ) {
                        $('.settings-input[name="' + s + '"][value="' + settings[s][i] + '"]').attr('checked', true);
                    }
                    break;
                }

                case 'formality' :
                case 'negation' : {
                    const value = settings[s].length > 1 ? "both" : settings[s][0];
                    $('.settings-input[name="' + s + '"][value="' + value + '"]').attr('checked', true);
                    break;
                }

                case 'timer' : {
                    const setting = $('.settings-input[name="' + s + '"][value="' + settings[s] + '"]');
                    setting.attr('checked', true);
                    if(!settings[s]) this.updateTimer( setting) ;
                    break;
                }

                default : {
                    const setting = $('.settings-input[name="' + s + '"]');
                    if(settings[s]) setting.attr('checked', true);
                    if(setting.hasClass('display-input')) this.updateDisplay( setting );
                }

            }
        }

    }

    initSettingsInputs() {

        const self = this, url = Routing.generate('settings.update');
        $('.settings-input').on('change', function() {

            const el = $(this);
            const param = el.attr('name');
            const value = param == "verbs" || param == "tenses" || el.is('[type="radio"]') ? el.val() : el.is(':checked');
            
            if( el.hasClass('display-input') ) self.updateDisplay( el );

            $.post(url, {
                param : param,
                value : value
            }, data => {
                self.settings = data;
                if( param == "timer" ) self.updateTimer( el );
                if( param == "voice" && !this.isMobile ) self.toggleVoice();
            }).fail( err => console.error(err) );

        });

    }

    updateDisplay(setting) {
        const el = $('#' + setting.attr('name'));
        setting.is(':checked') ? el.removeClass('hidden') : el.addClass('hidden');
    }

    onLoad() {
        this.loaderEl.fadeOut();
        this.homeActionsEl.fadeIn();
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Init elements ____________________________________________________________________________________________________________
    initSessionElements() {
        this.sessionEl = $('#session-container');
        this.homeEl = $('#home-container');
        this.homeActionsEl = $('#home-actions');
        this.configurationMissingEl = $('#configuration-missing');
        this.loaderEl = $('#loader');
        this.verbEl = $('#verb');
        this.furiganaEl = $('#furigana');
        this.romajiEl = $('#romaji');
        this.wordEl = $('#word');
        this.typeEl = $('#type');
        this.negationEl = $('#negation'), this.negationTextEl = this.negationEl.find('.conjugaison-text');
        this.tenseEl = $('#tense'), this.tenseTextEl = this.tenseEl.find('.conjugaison-text');
        this.formalityEl = $('#formality'), this.formalityTextEl = this.formalityEl.find('.conjugaison-text');
        this.definitionEl = $('#definition');
        this.successEl = $('#success');
        this.errorEl = $('#error');
        this.awardEl = $('#award');
    }

    initUserInputs() {

        const self = this;

        this.startEl = $('.start-btn');
        this.startEl.on('click', function(e) {
            if( self.playing ) return;
            self.start();
        });
        

        if(this.isMobile) $('label[for="input"]').attr('for','false');

        // Input
        this.inputEl = $('#input');
        wanakana.bind(this.inputEl[0]);

        // Form
        this.formEl = $('#form');
        this.formEl.on('submit', function(e) {
            e.preventDefault();
            if( self.disabled ) return;
            self.checkAnswer();
        });

        // Continue
        this.continueEl = $('#continue');
        this.continueEl.find('button').on('click', function() {
            //clearInterval( self.timeout );
            $(this).parent().hide().removeClass('empty-input');
            self.inputEl.attr('disabled', false).show();
            if( !self.isMobile ) self.inputEl.focus();
            if( self.disabled ) self.generate();
        });

    }

    // Session logic ____________________________________________________________________________________________________________
    stop(missing = true) {
        this.playing = false;
        this.clearTimer();
        this.sessionEl.hide();
        this.homeEl.show();
        this.speakBtnEl.attr('disabled', true);
        if( missing ) {
            this.homeActionsEl.hide();
            this.configurationMissingEl.show();
        } else {
            this.homeActionsEl.show();
            this.configurationMissingEl.hide();
        }
    }

    start() {
        this.playing = true;
        this.clearTimer();
        this.homeActionsEl.fadeOut();
        this.configurationMissingEl.fadeOut();
        this.loaderEl.fadeIn();
        const self = this;
        setTimeout( () => {
            this.speakBtnEl.attr('disabled', false);
            this.loaderEl.hide();
            self.sessionEl.show();
            self.homeEl.hide();
            self.wordEl.fitText(1, { maxFontSize: '70px' });
            self.generate();
        }, 1000);
       
    }
    
    getRandomValue(attribute) {
        return this.settings[attribute][ Math.floor( Math.random() * this.settings[attribute].length ) ];
    }

    generate() {

        this.verb = this.verbs[ this.getRandomValue('verbs') ];
        this.tense = this.tenses[ this.getRandomValue('tenses') ];

        if( null == this.verb || null == this.tense ) return this.stop();

        this.disabled = false;
        this.verbEl.attr('data-status', null);

        this.formality = 'formality' in this.tense ? this.tense.formality : this.getRandomValue('formality');
        this.negation = 'negation' in this.tense ? this.tense.negation : this.getRandomValue('negation');
        this.generateAudio( this.verb.reading ); 

        const conjugation = { vtype: this.verb.type, formality : this.formality, negated : this.negation, ...this.tense.conjugation };
        const word = this.conjugator.conjugate(this.verb.word, conjugation);
        const reading = this.conjugator.conjugate(this.verb.reading, conjugation).replace('下', 'くだ');
        const romaji = wanakana.toRomaji(reading);

        this.answer = {
            word : word,
            reading : reading,
            romaji : romaji
        };

        this.updateVoice();
        this.display();
        if( this.tutorial ) this.displayTutorial();
        else this.startTimer();

    }

    display(answer = false) {

        if( !answer ) this.inputEl.val("");
        else {
            this.successEl.text( this.score.success );
            this.errorEl.text( this.score.error );
        }
        
        this.romajiEl.text( answer ?  this.answer.romaji : this.verb.romaji );
        this.furiganaEl.text( answer ? this.answer.reading : this.verb.reading );
        this.wordEl.text( answer ? this.answer.word : this.verb.word );
        this.typeEl.text( this.verb.type );
        this.definitionEl.text( '「 ' + this.verb.definition + ' 」' );

        this.toAnimate = [];

        // Negation
        if( !this.history.length || this.history[0].negation !== this.negation ) {
            if( this.negation ) {
                this.negationEl.attr('data-conjugation','0');
                this.negationTextEl.text("negative");
            } else {
                this.negationEl.attr('data-conjugation','1');
                this.negationTextEl.text("positive");
            }
            this.toAnimate.push(this.negationEl);
        }

        // Formality
        if( !this.history.length || this.history[0].formality !== this.formality ) {
            this.formalityTextEl.text( this.formality );
            if( this.formality == 'plain' ) {
                this.formalityEl.attr('data-conjugation','0');
            } else {
                this.formalityEl.attr('data-conjugation','1');
            }
            this.toAnimate.push(this.formalityEl);
        }

        // Tense
        if( !this.history.length || this.history[0].tense !== this.tense ) {
            this.tenseTextEl.text( this.tense.label );
            this.toAnimate.push(this.tenseEl);
        }

        if( !this.tutorial ) this.speak();

    }

    initTutorial() {
        this.tutorialOverlayEl = $('#tutorial-overlay');
        this.tutorialBtnSkipEl = $('#tutorial-skip-btn');
        this.tutorialBtnEl = $('#tutorial-btn');
        this.tutorialTextEl = $('#tutorial-text');
        this.tutorialPhase = 0;
        var self = this;
        this.tutorialBtnEl.on('click', function() {
            self.tutorialPhase ++;
            self.displayTutorial();
        });
        this.tutorialBtnSkipEl.on('click', function() {
            self.closeTutorial();
        });
    }

    displayTutorial() {
       
        this.tutorialOverlayEl.fadeIn();

        if( this.tutorialPhase == 0 ) {
            // Verb
            this.wordEl.css('display','inline-block');
            var offset = this.wordEl.offset(), top = offset.top - 10 , left = offset.left - 10, right = left + this.wordEl.width() + 20, bottom = top + this.wordEl.height() + 20;
            this.tutorialOverlayEl.css('clip-path', 'polygon(0% 0%, 0% 100%, ' + left + 'px 100%, ' + left + 'px ' + top + 'px, ' + right + 'px ' + top + 'px, ' + right + 'px ' + bottom + 'px, ' + left + 'px ' + bottom + 'px, ' + left + 'px 100%, 100% 100%, 100% 0%)' );
            this.wordEl.css('display','block');
            this.tutorialTextEl.css({ 'top' : top - 40 + 'px' });
            this.tutorialTextEl.html('This is the verb you must conjugate :');
        }

        if( this.tutorialPhase == 1 ) {
            // Question
            var offset = $('.conjugaison-infos').offset(), top = offset.top , left = offset.left, right = left + 264, bottom = top + 55;
            this.tutorialOverlayEl.css('clip-path', 'polygon(0% 0%, 0% 100%, ' + left + 'px 100%, ' + left + 'px ' + top + 'px, ' + right + 'px ' + top + 'px, ' + right + 'px ' + bottom + 'px, ' + left + 'px ' + bottom + 'px, ' + left + 'px 100%, 100% 100%, 100% 0%)' );
            this.tutorialTextEl.css({ 'top' : top - 40 + 'px' });
            this.tutorialTextEl.html('This is how you must conjugate the verb :');
        }

        if( this.tutorialPhase == 2 ) {
            // Negative
            var offset = this.negationEl.offset(), top = offset.top , left = offset.left, right = left + 82, bottom = top + 55;
            this.tutorialOverlayEl.css('clip-path', 'polygon(0% 0%, 0% 100%, ' + left + 'px 100%, ' + left + 'px ' + top + 'px, ' + right + 'px ' + top + 'px, ' + right + 'px ' + bottom + 'px, ' + left + 'px ' + bottom + 'px, ' + left + 'px 100%, 100% 100%, 100% 0%)' );
            this.tutorialTextEl.html('<i class="material-icons pos">check_circle</i> <b>positive</b> or <i class="material-icons neg">do_not_disturb</i> <b>negative</b> :');
        }

        if( this.tutorialPhase == 3 ) {
            // Tense
            var offset = this.tenseEl.offset(), top = offset.top , left = offset.left, right = left + 100, bottom = top + 55;
            this.tutorialOverlayEl.css('clip-path', 'polygon(0% 0%, 0% 100%, ' + left + 'px 100%, ' + left + 'px ' + top + 'px, ' + right + 'px ' + top + 'px, ' + right + 'px ' + bottom + 'px, ' + left + 'px ' + bottom + 'px, ' + left + 'px 100%, 100% 100%, 100% 0%)' );
            this.tutorialTextEl.html('A random tense :');
        }

        if( this.tutorialPhase == 4 ) {
            // Formality
            var offset = this.formalityEl.offset(), top = offset.top , left = offset.left, right = left + 82, bottom = top + 55;
            this.tutorialOverlayEl.css('clip-path', 'polygon(0% 0%, 0% 100%, ' + left + 'px 100%, ' + left + 'px ' + top + 'px, ' + right + 'px ' + top + 'px, ' + right + 'px ' + bottom + 'px, ' + left + 'px ' + bottom + 'px, ' + left + 'px 100%, 100% 100%, 100% 0%)' );
            this.tutorialTextEl.html('<i class="material-icons pos">sms</i> <b>polite</b> or <i class="material-icons neg">sms_failed</i> <b>plain</b> :');
        }

        if( this.tutorialPhase == 5 ) {
            var offset = this.formEl.offset(), top = offset.top , left = offset.left, right = left + this.formEl.width(), bottom = top + this.formEl.height();
            this.tutorialOverlayEl.css('clip-path', 'polygon(0% 0%, 0% 100%, ' + left + 'px 100%, ' + left + 'px ' + top + 'px, ' + right + 'px ' + top + 'px, ' + right + 'px ' + bottom + 'px, ' + left + 'px ' + bottom + 'px, ' + left + 'px 100%, 100% 100%, 100% 0%)' );
            this.tutorialTextEl.css({ 'top' : top - 40 + 'px' });
            this.tutorialTextEl.html('Type the answer here, or use your voice :');
        }

        if( this.tutorialPhase == 6 ) {
            var s = $('#settings-btn');
            var offset = s.offset(), top = offset.top , left = offset.left, right = left + 51, bottom = top + s.height();
            this.tutorialOverlayEl.css('clip-path', 'polygon(0% 0%, 0% 100%, ' + left + 'px 100%, ' + left + 'px ' + top + 'px, ' + right + 'px ' + top + 'px, ' + right + 'px ' + bottom + 'px, ' + left + 'px ' + bottom + 'px, ' + left + 'px 100%, 100% 100%, 100% 0%)' );
            this.tutorialTextEl.css({ 'top' : bottom + 40 + 'px' });
            this.tutorialTextEl.html('Customize your quiz for a personalized experience :)');
        }

        if( this.tutorialPhase == 7 ) {
            this.closeTutorial();
        }

    }

    closeTutorial() {
        this.tutorial = false;
        this.tutorialOverlayEl.fadeOut();
        this.startTimer();
        this.speak();
    }

    updateHistory(success) {
        this.history.unshift({
            verb : this.verb,
            tense : this.tense,
            formality : this.formality,
            negation : this.negation,
            answer : this.answer,
            input : this.input,
            success : success
        });
    }

    checkAnswer(phrases = false, correct = false) {

        if(!correct) {
            this.input = this.inputEl.val().replace(/n/g, 'ん'); // Allows n => ん
            const kana = this.answer.reading.replace(/\//g, '|'), kanji = this.answer.word.replace(/\//g, '|'), kanjikana = kanji.replace('下', 'くだ');
            const regex = new RegExp('^(' + kana + '|' + kanji + '|' + kanjikana + ')$'); // Allows multi answers
            if(phrases) {

                let success = false;
                for( var i = 0; i < phrases.length; i++) {
                    if( regex.exec(phrases[i]) !== null ) success = true;
                }
                if( !success ) return;
                
                this.clearVoice();
                this.success();

            } else {
                this.clearVoice();
                regex.exec(this.input) === null ? this.error() : this.success();
            }

        } else {
            this.clearVoice();
            this.success();
        }

        this.disabled = true;
        this.clearTimer();

        // this.input = this.inputEl.val().replace(/n/g, 'ん'); // Allows n => ん
        
        // const kana = this.answer.reading.replace(/\//g, '|'), kanji = this.answer.word.replace(/\//g, '|');
        // const regex = new RegExp('^(' + kana + '|' + kanji + ')$'); // Allows multi answers

        // if( regex.exec(this.input) === null ) {
        //     if(voice) return;
        //     this.error();
        // } else {
        //     this.success(); 
        // }

        this.generateAudio(this.answer.reading);
        this.display(true);

    }

    success() {
        this.score.success++;
        this.updateHistory(true);
        this.verbEl.attr('data-status', 'success');
        this.inputEl.hide().val("").attr('disabled',true);
        this.continueEl.show();
        if( !this.isMobile ) this.continueEl.find('button').focus();
        this.animateAward();
    }

    error() {
        this.score.error++;
        this.updateHistory(false);
        this.verbEl.attr('data-status', 'error');
        this.inputEl.attr('disabled',true).hide();
        this.continueEl.show();
        if( !this.isMobile ) this.continueEl.find('button').focus();
    }

    // Animation ____________________________________________________________________________________________________________ 
    animate() {
        const self = this;
        this.animateZoom(true);
        setTimeout( () => self.animateZoom(false), 600);
    }

    animateZoom(zoom) {
        zoom ? this.wordEl.addClass('zooming') : this.wordEl.removeClass('zooming');
        if( this.toAnimate.length ) {
            for( var i = 0; i < this.toAnimate.length; i++ ) {
                zoom ? this.toAnimate[i].addClass('zooming') : this.toAnimate[i].removeClass('zooming');
            }
            if( !zoom) this.toAnimate = [];
        }
        if( !zoom && !this.disabled && !this.isMobile ) this.inputEl.focus();
    }

    animateAward() {
        var award = this.awardEl;
        award.fadeIn(400, function(){
            setTimeout( () => award.fadeOut(400, () => award.removeClass('animated') ), 1000 );
        }).addClass('animated');
    }

    // Audio ____________________________________________________________________________________________________________
    initSpeakBtn() {
        const self = this;
        this.speakBtnEl = $('#speak');
        this.speakBtnEl.on('click', () => self.speak() );
    }

    generateAudio(verb) {

        let audio = "";

        if( verb.indexOf('/') !== -1 ) {
            const stem = verb.split('(')[0];
            const conjugations = verb.split('(')[1].replace(/\)/g, '').split('/');
            for( let i = 0; i < conjugations.length; i++) {
                audio += stem + conjugations[i];
                if( i < conjugations.length - 1 ) audio += ", ";
            }
        } else {
            audio = verb;
        }

        this.audio = audio;

    }

    speak() {
        if(!this.settings.sound || !this.isAudioSupported()) return this.animate();

        var self = this;
        if(this.settings.voice && !this.isMobile) this.voice.abort();
        responsiveVoice.speak( this.audio, "Japanese Female", {
            pitch : 1,
            onstart : () => {
                self.animateZoom(true);
            },
            onend : () => {
                self.animateZoom(false);
                if(self.settings.voice && !self.isMobile) self.voice.resume();
            },
        });
    }
    
    isAudioSupported()
    {
        return typeof responsiveVoice !== "undefined";
    }

    // Timer ____________________________________________________________________________________________________________
    initTimer() {
        this.timerEl = $('#timer');
        this.timer = {
            el : $('#timer .determinate'),
            interval : null,
            maxTime : null,
            time : 0
        };
    }

    startTimer() {
        const maxTime = this.settings.timer, self = this, timer = this.timer, delay = 500;
        if(!maxTime) return;
        timer.maxTime = maxTime - delay;
        timer.interval = setInterval( function(){
            timer.time += 10;
            const width = Math.floor(timer.time / timer.maxTime * 100);
            timer.el.css('width', width + '%');
            if( timer.time >= timer.maxTime + delay ) self.checkAnswer();
        }, 10 );
    }

    clearTimer() {
        const timer = this.timer;
        clearInterval( timer.interval );
        timer.time = 0;
        timer.el.css('width', 0);
    }

    updateTimer(setting) {
        this.clearTimer();
        if(setting.val() == "false" ) {
            this.timerEl.addClass('hidden');
        } else {
            this.timerEl.removeClass('hidden');
            if( !this.disabled ) this.startTimer();
        }
        setting.val() !== "false" ? this.timerEl.removeClass('hidden') : this.timerEl.addClass('hidden');
    }

    // Voice ____________________________________________________________________________________________________________
    toggleVoice() {
        this.settings.voice ? this.voice.resume() : this.voice.pause();
    }
    
    isVoiceSupported() {
        var ua = window.navigator.userAgent;
        var browser = ua.indexOf("Chrome") != -1 || ua.indexOf("Samsung") != -1 || ua.indexOf("Baidu") != -1 || ua.indexOf("QQ Browser") != -1;
        var facebook = ua.indexOf('Instagram') != -1 || ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1;
        //$('body').append('<div style="position: absolute; bottom: 10px; left : 10px; font-size: 8px;">' + ua + '</div>');
        return annyang && browser && !facebook ? true : false;
    }

    initVoice() {

        this.voiceEl = $('#voice');

        if ( this.isVoiceSupported() ) {

            this.voice = annyang;
            this.voice.setLanguage('ja');
            if( this.settings.voice && !this.isMobile ) this.voice.start({ continuous : false });

            const self = this;
            this.voice.addCommands({
                'つぎ' : () => { self.continueEl.find('button').trigger('click'); }
            });
            
            this.voice.addCallback('resultNoMatch', function(phrases) {
                if(!self.disabled && self.playing) {
                    self.inputEl.val(phrases[0]);
                    self.checkAnswer(phrases);
                }
            });

            this.voice.addCallback('soundstart', function() {
                self.voiceEl.addClass('on');
            });

            this.voice.addCallback('end', function() {
                self.voiceEl.removeClass('on');
            });

            if( this.isMobile ) {
                this.voiceEl.on('touchstart', function(){
                    if( self.disabled ) return;
                    self.voiceEl.addClass('on');
                    self.voice.start({ autoRestart: false, continous : false });
                });
            }
            
        } else {
            this.settings.voice = false;
            this.voiceEl.hide();
            $('#voice-settings').addClass('unsupported');
            console.error( 'Browser not supported for voice recognition' );
        }

    }

    clearVoice() {
        if(this.settings.voice && this.history.length) {
            this.voice.removeCommands( this.history[0].answer.reading );
        }
    }

    updateVoice() {
        if( !this.settings.voice ) return;
        const commands = {}, self = this;
        commands[this.answer.reading] = () => { if(!self.disabled && self.playing) self.checkAnswer(null, true); };
        this.clearVoice();
        this.voice.addCommands(commands);
    }

}