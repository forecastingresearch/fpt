export default class Leapfrog {
    constructor(jsPsych, Experiment, task_query_string) {
        this.prettyname = "Leapfrog"
        this.duration_mins = 10
        this.browser_requirements = {min_width: 840, min_height: 500, mobile_allowed: false}
        this.exclusion_criteria = []
        if (Experiment.settings.TEST_EXCLUSION_CRITERIA) {
            this.exclusion_criteria = [
                {
                exclusion_condition: () => {return true},
                timeline_variables: [{'exclusion_reason_text': 'TESTING'}]
                }
            ]
        }
        this.media = ['img/instructions/leapfrog_demo.gif']
        this.media_promises = []
        
        this.jsPsych = jsPsych;
        this.Experiment = Experiment;

        this.modifiable_settings = this.get_modifiable_settings();
        this.default_settings = this.get_default_settings();
        this.settings = this.get_updated_settings_from_query(task_query_string);
        this.task_data = this.get_task_data();
        this.define_trials();
        this.timeline = this.get_timeline();

    }

    get_modifiable_settings() {
        let modifiable_settings = [
            {
                variable: 'SHOW_TASK',
                query_shortcode: 'show',
                prettyname: 'Show the task',
                input_type: 'checkbox'
            },
            {
                variable: 'TASK_ORDER_INDEX',
                query_shortcode: 'toi',
                prettyname: 'Task order index in the experiment',
                input_type: 'number'
            },
            {
                variable: 'SHORT_VERSION',
                query_shortcode: 'sv',
                prettyname: 'Short version (fewer trials)',
                input_type: 'checkbox'
            },
            {
                variable: 'USE_ANCHOR_VERSION',
                query_shortcode: 'uav',
                prettyname: 'Use ANCHOR version',
                input_type: 'checkbox'
            }
        ]
        return modifiable_settings
    }

    get_default_settings() {
        let settings = {}
        settings.SHOW_TASK = true
        settings.TASK_ORDER_INDEX = -999
        settings.SHORT_VERSION = false
        settings.USE_ANCHOR_VERSION = false

        settings.VOLATILITY = 0.125
        settings.TRIAL_TIME_LIMIT = 1500
        settings.POINTS_COUNTER = 0
        settings.ANCHOR_FORM_REWARDS = [{optionA:10,optionB:20},{optionA:10,optionB:20},{optionA:10,optionB:20},{optionA:10,optionB:20},{optionA:10,optionB:20},{optionA:10,optionB:20},{optionA:10,optionB:20},{optionA:30,optionB:20},{optionA:30,optionB:20},{optionA:30,optionB:20},{optionA:30,optionB:20},{optionA:30,optionB:20},{optionA:30,optionB:40},{optionA:30,optionB:40},{optionA:30,optionB:40},{optionA:30,optionB:40},{optionA:50,optionB:40},{optionA:50,optionB:40},{optionA:50,optionB:40},{optionA:50,optionB:40},{optionA:50,optionB:40},{optionA:50,optionB:40},{optionA:50,optionB:40},{optionA:50,optionB:40},{optionA:50,optionB:40},{optionA:50,optionB:40},{optionA:50,optionB:40},{optionA:50,optionB:60},{optionA:50,optionB:60},{optionA:50,optionB:60},{optionA:50,optionB:60},{optionA:50,optionB:60},{optionA:50,optionB:60},{optionA:50,optionB:60},{optionA:50,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:60},{optionA:70,optionB:80},{optionA:70,optionB:80},{optionA:70,optionB:80},{optionA:90,optionB:80},{optionA:90,optionB:80},{optionA:90,optionB:80},{optionA:90,optionB:80},{optionA:90,optionB:80},{optionA:90,optionB:80},{optionA:90,optionB:80},{optionA:90,optionB:80},{optionA:90,optionB:100},{optionA:90,optionB:100},{optionA:90,optionB:100},{optionA:90,optionB:100},{optionA:90,optionB:100},{optionA:90,optionB:100},{optionA:90,optionB:100},{optionA:90,optionB:100},{optionA:110,optionB:100},{optionA:110,optionB:120},{optionA:130,optionB:120},{optionA:130,optionB:120},{optionA:130,optionB:120},{optionA:130,optionB:120},{optionA:130,optionB:120},{optionA:130,optionB:120},{optionA:130,optionB:120},{optionA:130,optionB:140},{optionA:130,optionB:140},{optionA:150,optionB:140},{optionA:150,optionB:140},{optionA:150,optionB:140},{optionA:150,optionB:140},{optionA:150,optionB:140},{optionA:150,optionB:140},{optionA:150,optionB:140},{optionA:150,optionB:140},{optionA:150,optionB:140},{optionA:150,optionB:140},{optionA:150,optionB:140},{optionA:150,optionB:160},{optionA:150,optionB:160},{optionA:150,optionB:160},{optionA:150,optionB:160},{optionA:150,optionB:160},{optionA:150,optionB:160},{optionA:170,optionB:160},{optionA:170,optionB:160},{optionA:170,optionB:160},{optionA:170,optionB:160},{optionA:170,optionB:160},{optionA:170,optionB:180},{optionA:170,optionB:180},{optionA:170,optionB:180},{optionA:190,optionB:180},{optionA:190,optionB:200},{optionA:190,optionB:200},{optionA:190,optionB:200},{optionA:190,optionB:200},{optionA:210,optionB:200},{optionA:210,optionB:200},{optionA:210,optionB:200},{optionA:210,optionB:200},{optionA:210,optionB:200},{optionA:210,optionB:200},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:210,optionB:220},{optionA:230,optionB:220},{optionA:230,optionB:240},{optionA:230,optionB:240},{optionA:230,optionB:240},{optionA:230,optionB:240},{optionA:230,optionB:240},{optionA:230,optionB:240},{optionA:230,optionB:240},{optionA:230,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:240},{optionA:250,optionB:260},{optionA:250,optionB:260},{optionA:250,optionB:260},{optionA:270,optionB:260},{optionA:270,optionB:260},{optionA:270,optionB:260},{optionA:270,optionB:260},{optionA:270,optionB:260},{optionA:270,optionB:260},{optionA:270,optionB:260},{optionA:270,optionB:260},{optionA:270,optionB:280},{optionA:270,optionB:280},{optionA:270,optionB:280},{optionA:270,optionB:280},{optionA:270,optionB:280},{optionA:270,optionB:280},{optionA:270,optionB:280},{optionA:290,optionB:280},{optionA:290,optionB:280},{optionA:290,optionB:280},{optionA:290,optionB:300},{optionA:290,optionB:300},{optionA:310,optionB:300},{optionA:310,optionB:300},{optionA:310,optionB:300},{optionA:310,optionB:300},{optionA:310,optionB:300},{optionA:310,optionB:300},{optionA:310,optionB:320},{optionA:310,optionB:320}]
        
        // must be 4 PT BLOCKS!
        settings.PT_TRIALS_N = 80,
        settings.PT_TRIALS_PER_BLOCK = 20,
        settings.PT_BLOCKS = settings.PT_TRIALS_N / settings.PT_TRIALS_PER_BLOCK
        settings.TEST_TRIALS_N = 200,
        settings.TEST_TRIALS_PER_BLOCK = 40,
        settings.TEST_BLOCKS = settings.TEST_TRIALS_N / settings.TEST_TRIALS_PER_BLOCK

        this.get_short_version_trials = () => {
            return {
                PT_TRIALS_N : 20,
                PT_TRIALS_PER_BLOCK : 5,
                PT_BLOCKS : 4,
                TEST_TRIALS_N : 15,
                TEST_TRIALS_PER_BLOCK : 5,
                TEST_BLOCKS : 3,
            }
        }
    
        return settings
    }

    get_updated_settings_from_query(query_string) {
        // this could be in a generic Task class
        // the query params will always be in the format: task_name=setting1_prettyname,setting1_value,setting2_prettyname,setting2_value
        let settings = _.cloneDeep(this.default_settings)
        let query_arr = query_string.split(",")
        for (let i=0; i<query_arr.length; i+=2) {
            let curr_setting_obj = this.modifiable_settings.filter(e=>e.query_shortcode==query_arr[i])[0]
            if (curr_setting_obj) {
                let task_setting_type = typeof this.default_settings[curr_setting_obj.variable]
                settings[curr_setting_obj.variable] = this.Experiment.helper_funcs.string_to_type(query_arr[i+1], task_setting_type)
            }
        }
        if (Object.keys(settings).includes('SHORT_VERSION')) {
            if (settings.SHORT_VERSION) {
                let short_version_trials = this.get_short_version_trials()
                settings = _.merge(_.cloneDeep(settings), short_version_trials)
            }
        }
        return settings
    }

    get_task_data() {
        // each value for pt_trials and test_trials is an object, whose keys are the trial key (trial_001)
        // and values are objects with key-value pairs representing curr trial variable name-curr trial variable value
        // e.g. {'test_trials': 
        //			 {'trial_001': {
        //			 	'pt_trial': true, 
        //			 	'block': 0,
        //			 	'trial': 5,
        //			 	'myvar': 'myval'
        //			 }, 'trial_002': {...}}}
        const task_data = {'pt_trials': {}, 'test_trials': {}}
    
        // ------------------------PRACTICE TRIALS DATA
        const pt_starting_reward = this.jsPsych.randomization.shuffle([10, 20])
        let pt_current_reward = {
            optionA: pt_starting_reward[0],
            optionB: pt_starting_reward[1]
        }
        
        for (let pt_trial_ind = 0; pt_trial_ind < this.settings.PT_TRIALS_N; pt_trial_ind++) {	
    
            if (pt_trial_ind > 0 && this.jsPsych.randomization.sampleBernoulli(this.settings.VOLATILITY)){
                // a jump happens, where the inferior option becomes the superior one
                pt_current_reward[pt_current_reward.optionA < pt_current_reward.optionB ? 'optionA' : 'optionB'] += 20;
            }

            const pt_block_ind = Math.floor(pt_trial_ind / this.settings.PT_TRIALS_PER_BLOCK)
            const pt_block_key = this.Experiment.helper_funcs.format_ind_to_key(pt_block_ind, 'block')
            let pt_trial_key = this.Experiment.helper_funcs.format_ind_to_key(pt_trial_ind, 'trial')
    
            // only create block if it does not exist; see https://stackoverflow.com/q/66564488/13078832
            if (!task_data['pt_trials'][pt_block_key]) {
                task_data['pt_trials'][pt_block_key] = {}
            }
            task_data['pt_trials'][pt_block_key][pt_trial_key] = {
                'pt_trial': true,
                'block': pt_block_ind, 
                'trial': pt_trial_ind,
                'optionA_reward': pt_current_reward.optionA,
                'optionB_reward': pt_current_reward.optionB,
                'option_reward_label': pt_block_ind <= 1
            }
        }
    
        // ------------------------TEST TRIALS DATA
        let curr_pp_aig_version = this.settings.USE_ANCHOR_VERSION ? 'anchor' : 'aig'
        if (this.settings.TEST_TRIALS_N > 200) {
            console.error(`Incorrect settings for anchor form on ${this.prettyname} task. Proceeding with AIG form.`)
            curr_pp_aig_version = 'aig'
        }
        
        let current_reward
        if (curr_pp_aig_version == "aig") {
            const starting_reward = this.jsPsych.randomization.shuffle([10, 20])
            current_reward = {
                optionA: starting_reward[0],
                optionB: starting_reward[1]
            }
        }
        for (let test_trial_ind = 0; test_trial_ind < this.settings.TEST_TRIALS_N; test_trial_ind++) {
    
            if (curr_pp_aig_version == "aig") {
                if (test_trial_ind > 0 && this.jsPsych.randomization.sampleBernoulli(this.settings.VOLATILITY)){
                    // a jump happens, where the inferior option becomes the superior one
                    current_reward[current_reward.optionA < current_reward.optionB ? 'optionA' : 'optionB'] += 20;
                }
            } else {
                current_reward = this.settings.ANCHOR_FORM_REWARDS[test_trial_ind]
            }
    
            const test_block_ind = Math.floor(test_trial_ind / this.settings.TEST_TRIALS_PER_BLOCK)
            const test_block_key = this.Experiment.helper_funcs.format_ind_to_key(test_block_ind, 'block')
            let test_trial_key = this.Experiment.helper_funcs.format_ind_to_key(test_trial_ind, 'trial')
    
            // only create block if it does not exist; see https://stackoverflow.com/q/66564488/13078832
            if (!task_data['test_trials'][test_block_key]) {
                task_data['test_trials'][test_block_key] = {}
            }
            task_data['test_trials'][test_block_key][test_trial_key] = {
                'pt_trial': false,
                'block': test_block_ind, 
                'trial': test_trial_ind,
                'optionA_reward': current_reward.optionA,
                'optionB_reward': current_reward.optionB,
                'aig_version': curr_pp_aig_version
            }
        }
        return task_data
    }

    define_trials() {
        // it's quite common to refer to both the current trial context so this causes context conflict for the this keyword
        // therefore, for this method we will use self to refer to the class and this will be for whatever the current context is
        let self = this;

        function update_reward_points(animate) {
            let accumulated_points_text = document.querySelector('#points_counter_value')
            if (animate) {
                let time_to_update_text = 400
                let ms_per_increment = 10
                
                let curr_points_on_screen = parseInt(accumulated_points_text.innerHTML)
                let points_increment_per_ms = ((self.settings.POINTS_COUNTER - curr_points_on_screen) / time_to_update_text) * ms_per_increment
                let curr_points_tracker = parseInt(accumulated_points_text.innerHTML)
    
                let interval_id = setInterval(function() {
                    curr_points_tracker += points_increment_per_ms
                    if (curr_points_tracker >= self.settings.POINTS_COUNTER) {
                        accumulated_points_text.innerHTML = String(self.settings.POINTS_COUNTER)
                        clearInterval(interval_id)
                    } else {
                        if (curr_points_tracker >= curr_points_on_screen) {
                            curr_points_on_screen = Math.floor(curr_points_tracker)
                            accumulated_points_text.innerHTML = String(curr_points_on_screen)
                        }		
                    }
                    
                }, ms_per_increment)
                return interval_id
            } else {
                accumulated_points_text.innerHTML = String(self.settings.POINTS_COUNTER)
            }
        }

        self.general_instructions = {
            type: jsPsychInstructions,
            pages: [`<p class="instructions-title" style="text-align: center">Binary choice task</p>
                    <p>In this task, you will be making a series of choices between two options - Option A and Option B.</p>
                    <p>Here are the rules:</p>
                    <ul>
                        <li>Use the <b>left arrow key</b> to select option A and the <b>right arrow key</b> to select option B.</li>
                        <li>Each option is worth a certain point value. When you choose an option, we will tell you how many points you won by choosing it.</li>
                        <li>Your goal is to earn the most points.</li>
                        <li>At the beginning, one option will be worth 10 points and the other - 20 points.</li>
                        <li>At random intervals, one of the options’ point values will change.</li>
                        <li>The option that changes will always be the one worth less than the other. When it changes, it will always increase by 20 points. That means one option is always worth 10 points more than the other option.</li>
                        <li>For example, if Option A is initially worth 10 points and Option B is worth 20 points, at some point, Option A will increase to 30 points, meaning it is now worth 10 more points than Option B, which remains worth 20 points. Then, at some point, Option B will increase to 40 points, meaning Option B is now once again worth 10 more points than Option A. This will continue until the task ends.</li>
                        <li>The difficult part of this task is knowing when (and how often) to check if the other option is now worth more points. If you click on Option B forever, you'll never earn more points by clicking on Option A when Option A is worth more points. But, by clicking on Option A to check how many points it is worth, you may lose out on points from Option B.</li>
                    </ul>
                    <p>To reiterate, your task is to earn as many points as you can. We will track your point total at the top of the screen.</p>
                    <p>Proceed to the next page to see an example.</p>`,
                    
                    `<p class="instructions-title" style="text-align: center">Binary choice task</p>
                    <p>Below you can see a few example trials of the task. In these examples, we will show you what it's like to watch someone else try this task. The option that the person selects is marked in green. Notice:</p>
                    <ul>
                        <li>The point values of each option are shown below them. The participant taking the task <b>does not</b> see this information. When it's your turn to start the task, this information will not be available to you, we are showing it now only for illustration.</li>
                        <li>Every time a choice is made, the number of points won is shown. This information <b>will</b> be shown to you.</li>
                        <li>The point values of each option change from time to time.</li>
                        <li>The option that changes its point value always increases by 20 points.</li>
                        <li>The difference between the two options is always 10 points.</li>
                        <li>You have to be <b>quick</b>; you have 1.5 seconds to choose; you will see a <b>"too slow" message</b> if you did not respond in time, and you will earn no points.</li>
                    </ul>
                    <div style="width: 90%; margin: auto;"><img style="width: 100%; border: 2px solid black;" src="img/instructions/leapfrog_demo.gif"/></div>
                    <p>Please do note that this is only an example - how frequently the options change their points will be different from here on out.</p>`
            ],
            show_clickable_nav: true,
            allow_backward: false,
            allow_keys: false,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 180,
            on_finish: function(data) {
                data.trial_name = "leapfrog_instructions"
            }
        }
        
        self.pt_trials_instructions = {
            type: jsPsychInstructions,
            pages: [`<p class="instructions-title" style="text-align: center">Binary choice task</p>
                    <p>You will now complete ${self.settings.PT_TRIALS_N/2} practice decisions.</p>
                    <p><b>During the first 20 practice decisions</b>, you will be able to see how many points each option is worth. <b>For the other 20 practice decisions</b>, we will stop showing you this information, and you will only see how many points you won after making a choice.</p>
                    <p>During the practice decisions, every so often, you also will be asked to estimate how many changes are about to occur in the subsequent decisions, to help familiarize you with the change frequency.</p>
                    <hr>
                    <p>Now, please <b>place your right hand on the left and right arrow keys</b>.</p>
                    <p><i>Press the <b>spacebar</b> with your left hand whenever you are ready to continue!</i></p>
                    `],
            show_clickable_nav: false,
            allow_backward: false,
            key_forward: " ",
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 60,
            on_finish: function(data) {
                data.trial_name = "leapfrog_practice_trials_instructions"
            }
        }
        
        self.pt_trial = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function() {
                let html = `<div style="font-size:3em;">CHOOSE</div>
                        <div id="leapfrog_options_container">
                            <div id="option_A">OPTION A<br><span>(left arrow)</span></div>
                            <div id="option_B">OPTION B<br><span>(right arrow)</span></div>
                        </div>`
                if (self.jsPsych.timelineVariable('option_reward_label')) {
                    html += `<div style="display: flex; justify-content: space-around; font-size: 1em; margin-top: 1em; font-style: italic">
                                <div>${self.jsPsych.timelineVariable('optionA_reward')} points</div>
                                <div>${self.jsPsych.timelineVariable('optionB_reward')} points</div>
                            </div>`
                }
                return html    
            },
            choices: ['arrowleft', 'arrowright'],
            trial_duration: self.Experiment.settings.SIMULATE ? self.Experiment.settings.SIMULATE_TRIAL_DURATION*1.2 : self.settings.TRIAL_TIME_LIMIT,
            css_classes: ['leapfrog-trial-class'],
            on_load: function() {
                if (self.jsPsych.timelineVariable('trial') === 0) {document.querySelector("#points_counter_container").style.display = "flex"}
                
                // ---- USE THIS ONLY TO CREATE A LEAPFROG_DEMO.GIF
                // let more_valuable_option = self.jsPsych.timelineVariable('optionA_reward') > self.jsPsych.timelineVariable('optionB_reward') ? 'A' : 'B'
                // let key_to_press = more_valuable_option == 'A' ? 'arrowleft' : 'arrowright'
                // document.querySelector("#option_A").style.border = "3px solid transparent"
                // document.querySelector("#option_B").style.border = "3px solid transparent"
                // document.querySelector("#option_A").style.padding = "8px"
                // document.querySelector("#option_B").style.padding = "8px"
                // self.jsPsych.pluginAPI.setTimeout(() => {
                //     document.querySelector(`#option_${more_valuable_option}`).style.border = "3px solid green"
                //     self.jsPsych.pluginAPI.setTimeout(() => {
                //         self.jsPsych.pluginAPI.pressKey(key_to_press);
                //     }, 500)
                // }, 1000)
            },
            on_finish: function(data) {
                data.trial_name = "leapfrog_pt_trial"
                data.pt_trial = self.jsPsych.timelineVariable('pt_trial')
                data.block = self.jsPsych.timelineVariable('block')
                data.trial = self.jsPsych.timelineVariable('trial')
                data.optionA_reward = self.jsPsych.timelineVariable('optionA_reward')
                data.optionB_reward = self.jsPsych.timelineVariable('optionB_reward')
        
                if (data.response == 'arrowleft') {
                    data.points_won = data.optionA_reward
                    data.option_selected = "A"
                } else if (data.response == 'arrowright') {
                    data.points_won = data.optionB_reward
                    data.option_selected = "B"
                }
            },
            simulation_options: 'leapfrog_trial_response'
        }
        
        self.pt_trial_interblock_question = {
            type: jsPsychSurveyHtmlForm,
            html: function() {
                let html = `<p>Based on what you have seen so far, how many times do you expect one of the options to change its value in the next <b>${self.jsPsych.timelineVariable('end_block') ? 100 : self.settings.PT_TRIALS_PER_BLOCK}</b> decisions?</p>
                        <p>Enter your prediction (numbers only) in the box below.</p>
                        <div style="margin-bottom: 2em;">
                            <input name="prediction" id="prediction_input" type="text" placeholder="0-99" ${!(self.Experiment.settings.IGNORE_VALIDATION === true) ? "required='true'" : ""}>
                        </div>`
                return html
            },
            timer: 20,
            on_load: function() {
                let next_button = document.querySelector("#jspsych-survey-html-form-next")
                let prediction_input = document.getElementById('prediction_input')
                if (!(self.Experiment.settings.IGNORE_VALIDATION === true)) {
                    next_button.disabled = true
        
                    prediction_input.addEventListener('input', function(e) {
                        if (/^(?:[0-9]|[1-9][0-9])$/.test(e.target.value)) {
                            next_button.disabled = false;
                        } else {
                            next_button.disabled = true;
                        }
                    })
                }
        
                if (self.Experiment.settings.SIMULATE) {
                    next_button.disabled = false
                    prediction_input.value = self.jsPsych.randomization.randomInt(0,99)
                }
            },
            on_finish: function(data) {
                data.trial_name = "leapfrog_pt_trial_interblock_question"
                data.curr_block_ind = self.jsPsych.timelineVariable('curr_block_ind')
                data.pt_trial_prediction = data.response ? parseInt(data.response['prediction']) : null
            },
            simulation_options: {simulate: true}
        }

        self.pt_trial_after_interblock = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function() {
                let html = `<p>Now, please <b>place your right hand on the left and right arrow keys</b>.</p>
                            <p><i>Press the <b>spacebar</b> with your left hand whenever you are ready to continue!</i></p>`
                if (self.jsPsych.data.get().last(1).values()[0].curr_block_ind === 2) {
                    // prepending!
                    html = `<p>You will now complete another ${self.settings.PT_TRIALS_N/2} practice trials.</p>
                            <p>During these trials you will <b>NOT</b> be able to see the points of each option. You have to discover this on your own.</p>
                            <hr>` 
                            + html
                }
                return html
            },
            choices: [" "],
            timer: 20,
            on_finish: function(data) {
                data.trial_name = "pt_trial_after_interblock"
            }
        }

        self.test_trials_instructions = {
            type: jsPsychInstructions,
            pages: function() {
                let optionA_reward = self.task_data['test_trials']['block_000']['trial_000']['optionA_reward']
                let optionB_reward = self.task_data['test_trials']['block_000']['trial_000']['optionB_reward']
        
                let more_valuable_option = optionA_reward > optionB_reward ? 'A' : 'B'
                let less_valuable_option = more_valuable_option == 'B' ? 'A' : 'B'
                return [`<p class="instructions-title" style="text-align: center">Binary choice task</p>
                    <p>We will now progress to the test decisions. You will complete ${self.settings.TEST_TRIALS_N} test decisions.</p>
                    <p><b>NB: Initially Option ${more_valuable_option} will be worth 20 points and Option ${less_valuable_option} will be worth 10 points. So you should first select Option ${more_valuable_option} to maximize your points.</b> Remember that the points of each option will change over time.</p>
                    <p>Remember that your task is to win as many points as possible.</p>
                    <p>Here are the rules again if you would like to review them one more time:</p>
                    <ul>
                        <li>Use the <b>left arrow key</b> to select option A and the <b>right arrow key</b> to select option B.</li>
                        <li>Each option is worth a certain point value. When you choose an option, we will tell you how many points you won by choosing it.</li>
                        <li>Your goal is to earn the most points.</li>
                        <li>At the beginning, one option will be worth 10 points and the other - 20 points.</li>
                        <li>At random intervals, one of the options’ point values will change.</li>
                        <li>The option that changes will always be the one worth less than the other. When it changes, it will always increase by 20 points. That means one option is always worth 10 points more than the other option.</li>
                        <li>For example, if Option A is initially worth 10 points and Option B is worth 20 points, at some point, Option A will increase to 30 points, meaning it is now worth 10 more points than Option B, which remains worth 20 points. Then, at some point, Option B will increase to 40 points, meaning Option B is now once again worth 10 more points than Option A. This will continue until the task ends.</li>
                        <li>The difficult part of this task is knowing when (and how often) to check if the other option is now worth more points. If you click on Option B forever, you'll never earn more points by clicking on Option A when Option A is worth more points. But, by clicking on Option A to check how many points it is worth, you may lose out on points from Option B.</li>
                    </ul>
                    <hr>
                    <p>Now, please <b>place your right hand on the left and right arrow keys</b>.</p>
                    <p><i>Press the <b>spacebar</b> with your left hand whenever you are ready to continue!</i></p>
                    `]
            },
            on_start: function(trial) {
                self.settings.POINTS_COUNTER = 0
                document.querySelector("#points_counter_value").innerHTML = "0";
                document.querySelector("#points_counter_container").style.display = "none"
            },
            show_clickable_nav: false,
            allow_backward: false,
            key_forward: " ",
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 90,
            on_finish: function(data) {
                data.trial_name = "leapfrog_test_trials_instructions"
            }
        }

        self.test_trial = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `<div style="font-size:3em; color: choose;">CHOOSE</div>
                        <div style="display: flex; justify-content: space-around; font-size: 2em; margin-top: 2em;">
                            <div>OPTION A<br><span style="font-size: 0.5em"><i>(left arrow)</i></span></div>
                            <div>OPTION B<br><span style="font-size: 0.5em"><i>(right arrow)</i></span></div>
                        </div>`,
            choices: ['arrowleft', 'arrowright'],
            trial_duration: self.Experiment.settings.SIMULATE ? self.Experiment.settings.SIMULATE_TRIAL_DURATION*1.2 : self.settings.TRIAL_TIME_LIMIT,
            css_classes: ['leapfrog-trial-class'],
            on_start: function(trial) {
                if (self.jsPsych.timelineVariable('trial') === 0) {document.querySelector("#points_counter_container").style.display = "flex"}
            },
            on_finish: function(data) {
                data.trial_name = "leapfrog_trial"
                data.pt_trial = self.jsPsych.timelineVariable('pt_trial')
                data.block = self.jsPsych.timelineVariable('block')
                data.trial = self.jsPsych.timelineVariable('trial')
                data.optionA_reward = self.jsPsych.timelineVariable('optionA_reward')
                data.optionB_reward = self.jsPsych.timelineVariable('optionB_reward')
        
                if (data.response == 'arrowleft') {
                    data.points_won = data.optionA_reward
                    data.option_selected = "A"
                } else if (data.response == 'arrowright') {
                    data.points_won = data.optionB_reward
                    data.option_selected = "B"
                }
            },
            simulation_options: 'leapfrog_trial_response'
        }
        
        self.trial_feedback = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function() {
                if (self.jsPsych.data.get().last(1).values()[0]['rt'] === null) {
                    return '<p style="font-size: 3em; color: red;">X<br><br>TOO SLOW</p>'
                } else {
                    let points_won = self.jsPsych.data.get().last(1).values()[0]['points_won']
                    self.settings.POINTS_COUNTER += points_won
                    update_reward_points(!self.Experiment.settings.SIMULATE)
                    return `<p style="font-size: 3em; color: green;">You won <b>${points_won}</b> points.</p>`
                }
            },
            choices: "NO_KEYS",
            trial_duration: self.Experiment.settings.SIMULATE === true ? self.Experiment.settings.SIMULATE_TRIAL_DURATION : 1000,
            on_finish: function(data) {
                if (self.jsPsych.timelineVariable('pt_trial') === false & self.jsPsych.timelineVariable('trial') === self.settings.TEST_TRIALS_N-1) {
                    // self.settings.POINTS_COUNTER = 0
                    document.querySelector("#points_counter_value").innerHTML = "0";
                    document.querySelector("#points_counter_container").style.display = "none"
                }
                data.trial_name = "leapfrog_trial_feedback"
            }
        }
    }

    get_timeline() {
        let timeline = []
        if (this.Experiment.saved_progress.data_checkpoints.includes(`${this.prettyname}__completed`)) {
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
        } else {
            timeline.push(this.Experiment.trial_generators.wait_for_media_load(this))
            timeline.push(this.Experiment.trial_generators.add_task_stylesheet("leapfrog_task"))
            if (this.Experiment.settings.INSTRUCTIONS_ONLY) {
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Leapfrog - instructions'], show_clickable_nav: true})
                timeline.push(this.general_instructions)
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Leapfrog - practice trials intro'], show_clickable_nav: true})
                timeline.push(this.pt_trials_instructions)
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Leapfrog - test trials intro'], show_clickable_nav: true})
                timeline.push(this.test_trials_instructions)
            } else {
                const timeline_pt_trials_interblock_timeline = {
                    timeline: [this.pt_trial_interblock_question, this.pt_trial_after_interblock],
                    timeline_variables: [{'end_block': false}]
                }
                const pt_trials_timeline = this.Experiment.helper_funcs.get_task_trials_timeline_with_interblock_text([this.pt_trial, this.trial_feedback], 
                    this.settings.PT_BLOCKS, 
                    timeline_pt_trials_interblock_timeline, 
                    this.task_data.pt_trials,
                    'pt')
                const test_trials_timeline = this.Experiment.helper_funcs.get_task_trials_timeline_with_interblock_text([this.test_trial, this.trial_feedback], 
                    this.settings.TEST_BLOCKS, 
                    null,
                    // timeline_main_trials_interblock_timeline, 
                    this.task_data.test_trials,
                    'test')
                timeline.push(this.general_instructions)
                if (this.Experiment.settings.TEST_EXCLUSION_CRITERIA) {timeline.push(this.Experiment.trial_generators.exclusion_timeline(this.exclusion_criteria))}
                timeline.push(this.Experiment.hide_progress_bar())
                timeline.push(this.pt_trials_instructions)
                timeline.push(pt_trials_timeline)
                timeline.push({timeline: [this.pt_trial_interblock_question], timeline_variables: [{'end_block': true, 'curr_block_ind': 99}]})
                timeline.push(this.test_trials_instructions)
                timeline.push(test_trials_timeline)
            }
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
            timeline.push(this.Experiment.trial_generators.get_task_feedback(this.prettyname))
            timeline.push(this.Experiment.trial_generators.remove_task_stylesheet("leapfrog_task"))
            timeline.push(this.Experiment.trial_generators.exclusion_timeline(this.exclusion_criteria))
            timeline.push(this.Experiment.trial_generators.async_data_save(`${this.prettyname}__completed`))
        }
        return {timeline: timeline}
    }
}