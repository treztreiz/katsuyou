class Katsuyou {

    constructor() {

        const self = this;

        this.disabled = true;
        this.history = [];

        // Init conjugation
        this.conjugator = new(JsLingua.getService("Morpho", 'jpn'))();
        this.conjugations = this.conjugator.getForms();

        // Load settings
        $.post( Routing.generate('load'), data => self.init(data) ).fail( err => console.error(err) );

        // Init elements
        this.initSessionElements();
        this.initUserInput();
        this.initSpeakBtn();
        this.initTimer();

    }

    // Init loaded data / settings ____________________________________________________________________________________________________________
    init(data) {
        this.initVerbs( data.verbs );
        this.initTenses( data.tenses );
        this.initSettings( data.settings );
        this.initSettingsInputs();
        this.generate();
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

        this.verbs = verbs, this.verbsEl = $('#verbs-settings'), this.verbsTpl = $('#verbs-template');
        for( let v in  verbs ) {
            const verb = verbs[v];
            this.verbsEl.append($(
                this.verbsTpl.html()
                .replace('#id#', v)
                .replace('#word#', verb.word)
                .replace('#furigana#', verb.reading)
                .replace('#romaji#', verb.romaji)
                .replace('#type#', verb.type)
                .replace('#definition#', verb.definition)
            ));
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

            const param = $(this).attr('name');
            const value = param == "verbs" || param == "tenses" || $(this).is('[type="radio"]') ? $(this).val() : $(this).is(':checked');
            
            if( $(this).hasClass('display-input') ) self.updateDisplay( $(this) );

            $.post(url, {
                param : param,
                value : value
            }, data => {
                self.settings = data;
            }).fail( err => console.error(err) );

        });

    }

    updateDisplay(setting) {
        const el = $('#' + setting.attr('name'));
        setting.is(':checked') ? el.removeClass('hidden') : el.addClass('hidden');
    }

    // Init elements ____________________________________________________________________________________________________________
    initSessionElements() {
        this.verbEl = $('#verb');
        this.furiganaEl = $('#furigana');
        this.romajiEl = $('#romaji');
        this.wordEl = $('#word'), this.wordEl.fitText(1, { maxFontSize: '70px' });
        this.typeEl = $('#type');
        this.negationEl = $('#negation'), this.negationTextEl = this.negationEl.find('.conjugaison-text');
        this.tenseEl = $('#tense'), this.tenseTextEl = this.tenseEl.find('.conjugaison-text');
        this.formalityEl = $('#formality'), this.formalityTextEl = this.formalityEl.find('.conjugaison-text');
        this.definitionEl = $('#definition');
    }

    initUserInput() {

        const self = this;
        
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
            $(this).parent().css('opacity', 0).removeClass('empty-input');
            self.inputEl.attr('disabled', false).focus();
            if( self.disabled ) self.generate();
        });

    }

    // Session logic ____________________________________________________________________________________________________________
    getRandomValue(attribute) {
        return this.settings[attribute][ Math.floor( Math.random() * this.settings[attribute].length ) ];
    }

    generate() {

        this.disabled = false;
        this.verbEl.attr('data-status', null);

        this.verb = this.verbs[ this.getRandomValue('verbs') ];
        this.tense = this.tenses[ this.getRandomValue('tenses') ];
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

        this.display();
        this.startTimer();

    }

    display(answer = false) {

        if( !answer ) this.inputEl.val("");

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

        if( this.settings.sound ) this.speak();

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

    checkAnswer() {

        this.disabled = true;
        this.clearTimer();
        this.input = this.inputEl.val().replace(/n/g, 'ん'); // Allows n => ん

        const regex = new RegExp('^' + this.answer.reading.replace(/\//g, '|') + '$'); // Allows multi answers
        regex.exec(this.input) !== null ? this.success() : this.error();

        this.generateAudio(this.answer.reading);
        this.display(true);

    }

    success() {
        this.updateHistory(true);
        this.verbEl.attr('data-status', 'success');
        this.inputEl.val("").attr('disabled',true);
        this.continueEl.css('opacity', 1).addClass('empty-input').find('button').focus();
    }

    error() {
        this.updateHistory(false);
        this.verbEl.attr('data-status', 'error');
        this.inputEl.attr('disabled',true);
        this.continueEl.css('opacity', 1).find('button').focus();
        if( this.inputEl.val() == "" ) this.continueEl.addClass('empty-input');
    }

    // Audio ____________________________________________________________________________________________________________
    initSpeakBtn() {
        const self = this;
        this.speakBtn = $('#speak');
        this.speakBtn.on('click', () => self.speak() );
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
        var self = this;
        responsiveVoice.speak( this.audio, "Japanese Female", {
            pitch : 1,
            onstart : () => {
                self.wordEl.addClass('zooming');
                if( self.toAnimate.length ) {
                    for( var i = 0; i < self.toAnimate.length; i++ ){
                        self.toAnimate[i].addClass('zooming');
                    }
                }
            },
            onend : () => {
                self.wordEl.removeClass('zooming');
                if( self.toAnimate.length ) {
                    for( var i = 0; i < self.toAnimate.length; i++ ){
                        self.toAnimate[i].removeClass('zooming');
                    }    
                    self.toAnimate = [];
                }
                if(!self.disabled) self.inputEl.focus();
            },
        });
    }

    // Timer ____________________________________________________________________________________________________________
    initTimer() {
        this.timer = {
            el : $('#timer .determinate'),
            interval : null,
            time : 0,
            maxTime : 10000
        };
    }

    startTimer() {
        const self = this, timer = this.timer;
        timer.interval = setInterval( function(){
            timer.time += 10;
            const width = Math.floor(timer.time / timer.maxTime * 100);
            timer.el.css('width', width + '%');
            if( timer.time >= timer.maxTime ) self.checkAnswer();
        }, 10 );
    }

    clearTimer() {
        const timer = this.timer;
        clearInterval( timer.interval );
        timer.time = 0;
        timer.el.css('width', 0);
    }

}