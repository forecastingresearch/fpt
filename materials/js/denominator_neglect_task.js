export default class Denominator_Neglect {
    constructor(jsPsych, Experiment, task_query_string) {
        // this.prettyname = "Denominator Neglect"
        this.duration_mins = 4
        this.browser_requirements = {min_width: 840, min_height: 500, mobile_allowed: false}
        this.media = ["img/instructions/DN_VersionA_example_text.png", "img/instructions/DN_VersionA_example_array.png",
                        "img/instructions/DN_VersionA_demo.gif", "img/instructions/DN_VersionB_demo.gif"];
        this.media_promises = []
        this.exclusion_criteria = []

        this.jsPsych = jsPsych;
        this.Experiment = Experiment;

        this.modifiable_settings = this.get_modifiable_settings();
        this.default_settings = this.get_default_settings();
        this.settings = this.get_updated_settings_from_query(task_query_string);

        this.prettyname = `Denominator Neglect_${this.settings["TASK_VERSION"]}`
        // this.settings.TASK_ORDER_INDEX = this.Experiment.saved_progress[this.prettyname].task_order_index
        
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
                variable: 'USE_ANCHOR_VERSION',
                query_shortcode: 'uav',
                prettyname: 'Use ANCHOR version',
                input_type: 'checkbox'
            },
            {
                variable: 'SHORT_VERSION',
                query_shortcode: 'sv',
                prettyname: 'Short version (fewer trials)',
                input_type: 'checkbox'
            },
            // we need this to be modifiable in order to set it dynamically
            {
                variable: 'TASK_VERSION',
                query_shortcode: 'tv',
                prettyname: 'Task version (A = visual OR text; B = both)',
                input_type: 'select',
                input_options: [
                    {value: "A", label: "A"},
                    {value: "B", label: "B"}
                ]
            }
        ]
        return modifiable_settings
    }

    get_default_settings() {
        let settings = {}
        settings.SHOW_TASK = true
        settings.SHORT_VERSION = false
        settings.TASK_ORDER_INDEX = -999
        settings.USE_ANCHOR_VERSION = false

        settings.TASK_VERSION = ""
        settings.TRIAL_CHOICE_TYPES = ["conflict", "harmony"]
        settings.SMALL_LOTTERY_GOLD_COIN_PROPS = [0.10, 0.20, 0.30]
        settings.LARGE_LOTTERY_GOLD_COIN_PROP_RANGE_DIFF = [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08]
        settings.DENOMINATOR_DISPLAY_TYPES = {
            task_version_A: [{small: "text", large: "text"}, {small: "array", large: "array"}, {small: "text", large: "array"}, {small: "array", large: "text"}],
            task_version_B: [{small: "both", large: "both"}]
        }
        settings.LOTTERY_TOTAL_COINS = {small: 10, large: 400}
        settings.TRIAL_TIME_LIMIT = 5000
        settings.GOLD_COINS_COUNTER = 0
        settings.ANCHOR_FORM_DATA = {
            task_version_A: {
                left_lottery_types: ["small","large","large","large","small","small","large","small","small","large","small","large","small","large","large","small","large","large","small","large","small","small","large","small","large","small","large","large","small","small","small","small","small","small","small","large","small","large","large","small","large","small","small","large","large","large","large","large"],
                denominator_display_types: {"conflict":[{"small":"text","large":"text"},{"small":"text","large":"array"},{"small":"array","large":"array"},{"small":"array","large":"array"},{"small":"text","large":"array"},{"small":"array","large":"array"},{"small":"array","large":"text"},{"small":"array","large":"text"},{"small":"array","large":"array"},{"small":"array","large":"array"},{"small":"text","large":"array"},{"small":"array","large":"text"},{"small":"array","large":"text"},{"small":"text","large":"array"},{"small":"array","large":"array"},{"small":"text","large":"text"},{"small":"text","large":"text"},{"small":"text","large":"text"},{"small":"text","large":"array"},{"small":"text","large":"text"},{"small":"array","large":"text"},{"small":"array","large":"text"},{"small":"text","large":"array"},{"small":"text","large":"text"}],"harmony":[{"small":"text","large":"text"},{"small":"array","large":"text"},{"small":"text","large":"text"},{"small":"array","large":"text"},{"small":"array","large":"text"},{"small":"array","large":"text"},{"small":"array","large":"array"},{"small":"array","large":"array"},{"small":"text","large":"text"},{"small":"text","large":"array"},{"small":"text","large":"array"},{"small":"text","large":"text"},{"small":"array","large":"array"},{"small":"text","large":"array"},{"small":"array","large":"array"},{"small":"array","large":"text"},{"small":"array","large":"array"},{"small":"text","large":"text"},{"small":"text","large":"array"},{"small":"text","large":"array"},{"small":"array","large":"text"},{"small":"text","large":"text"},{"small":"array","large":"array"},{"small":"text","large":"array"}]},
                left_lottery_gold_prop: [0.2,0.29,0.27,0.28,0.2,0.3,0.07,0.3,0.1,0.36,0.1,0.28,0.1,0.14,0.18,0.2,0.26,0.25,0.2,0.13,0.2,0.3,0.18,0.2,0.12,0.1,0.25,0.23,0.2,0.3,0.2,0.3,0.3,0.2,0.1,0.16,0.1,0.31,0.27,0.1,0.19,0.1,0.3,0.26,0.05,0.34,0.06,0.24],
                right_lottery_gold_prop: [0.22,0.3,0.2,0.2,0.13,0.37,0.1,0.24,0.03,0.3,0.09,0.3,0.15,0.1,0.1,0.15,0.2,0.3,0.21,0.1,0.12,0.38,0.2,0.14,0.1,0.17,0.2,0.3,0.23,0.32,0.17,0.22,0.35,0.16,0.02,0.1,0.11,0.3,0.3,0.04,0.2,0.08,0.33,0.3,0.1,0.3,0.1,0.2],
                left_lottery_total_coins: [10,400,400,400,10,10,400,10,10,400,10,400,10,400,400,10,400,400,10,400,10,10,400,10,400,10,400,400,10,10,10,10,10,10,10,400,10,400,400,10,400,10,10,400,400,400,400,400],
                right_lottery_total_coins: [400,10,10,10,400,400,10,400,400,10,400,10,400,10,10,400,10,10,400,10,400,400,10,400,10,400,10,10,400,400,400,400,400,400,400,10,400,10,10,400,10,400,400,10,10,10,10,10]
            },
            task_version_B: {
                left_lottery_types: ["small","small","large","large","small","small","large","small","small","large","large","small","large","small","large","large","large","small","large","small","small","large","large","small","small","large","large","small","small","large","large","small","small","large","small","large","small","large","small","large","small","small","small","large","large","large","small","large"],
                denominator_display_types: {"conflict":[{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"}],"harmony":[{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"},{"small":"both","large":"both"}]},
                left_lottery_gold_prop: [0.2,0.3,0.24,0.14,0.1,0.2,0.35,0.1,0.3,0.07,0.09,0.3,0.18,0.1,0.34,0.22,0.32,0.3,0.27,0.1,0.3,0.08,0.15,0.1,0.1,0.25,0.29,0.1,0.2,0.18,0.16,0.3,0.2,0.33,0.3,0.38,0.2,0.17,0.2,0.26,0.2,0.3,0.2,0.02,0.04,0.12,0.1,0.27],
                right_lottery_gold_prop: [0.13,0.25,0.3,0.1,0.03,0.23,0.3,0.05,0.31,0.1,0.1,0.22,0.2,0.16,0.3,0.2,0.3,0.26,0.3,0.15,0.23,0.1,0.2,0.11,0.13,0.2,0.3,0.12,0.14,0.1,0.2,0.37,0.19,0.3,0.36,0.3,0.24,0.1,0.21,0.2,0.28,0.28,0.17,0.1,0.1,0.2,0.06,0.2],
                left_lottery_total_coins: [10,10,400,400,10,10,400,10,10,400,400,10,400,10,400,400,400,10,400,10,10,400,400,10,10,400,400,10,10,400,400,10,10,400,10,400,10,400,10,400,10,10,10,400,400,400,10,400],
                right_lottery_total_coins: [400,400,10,10,400,400,10,400,400,10,10,400,10,400,10,10,10,400,10,400,400,10,10,400,400,10,10,400,400,10,10,400,400,10,400,10,400,10,400,10,400,400,400,10,10,10,400,10]
            }
        }

        settings.PT_TRIALS_N = 8
        settings.PT_TRIALS_PER_BLOCK = 8
        settings.PT_BLOCKS = settings.PT_TRIALS_N / settings.PT_TRIALS_PER_BLOCK
        settings.TEST_TRIALS_N = 48
        settings.TEST_TRIALS_PER_BLOCK = 48
        settings.TEST_BLOCKS = settings.TEST_TRIALS_N / settings.TEST_TRIALS_PER_BLOCK

        this.get_short_version_trials = () => {
            return {
                PT_TRIALS_N : 8,
                PT_TRIALS_PER_BLOCK : 8,
                PT_BLOCKS : 1,
                TEST_TRIALS_N : 8,
                TEST_TRIALS_PER_BLOCK : 8,
                TEST_BLOCKS : 1,
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
        let pt_left_lottery_types = this.jsPsych.randomization.shuffle(this.Experiment.helper_funcs.expandArray(["small", "large"], this.settings.PT_TRIALS_N/2))  
        let pt_denominator_display_types = {
            conflict: this.settings.TASK_VERSION==="A" ? this.jsPsych.randomization.shuffle(this.Experiment.helper_funcs.expandArray(this.settings.DENOMINATOR_DISPLAY_TYPES.task_version_A, this.settings.PT_TRIALS_N/8)) : this.Experiment.helper_funcs.expandArray(this.settings.DENOMINATOR_DISPLAY_TYPES.task_version_B, this.settings.PT_TRIALS_N/2),
            harmony: this.settings.TASK_VERSION==="A" ? this.jsPsych.randomization.shuffle(this.Experiment.helper_funcs.expandArray(this.settings.DENOMINATOR_DISPLAY_TYPES.task_version_A, this.settings.PT_TRIALS_N/8)) : this.Experiment.helper_funcs.expandArray(this.settings.DENOMINATOR_DISPLAY_TYPES.task_version_B, this.settings.PT_TRIALS_N/2),
        }
        const pt_choice_types = this.jsPsych.randomization.shuffle(this.Experiment.helper_funcs.expandArray(['conflict', 'harmony'], this.settings.PT_TRIALS_N/2))
        const pt_choice_type_counters = {
            conflict: 0,
            harmony: 0
        };
        for (let pt_trial_ind = 0; pt_trial_ind < this.settings.PT_TRIALS_N; pt_trial_ind++) {
            const choice_type = pt_choice_types[pt_trial_ind]
            // we first use the last index of the counters to index the denominator_display_types[choice_type] and then the ++ increments it for the next iteration
            const current_denominator_display_types = pt_denominator_display_types[choice_type][pt_choice_type_counters[choice_type]++];
            const small_lottery_gold_coin_prop = this.jsPsych.randomization.sampleWithoutReplacement(this.settings.SMALL_LOTTERY_GOLD_COIN_PROPS, 1)[0]
            const curr_trial_diff = this.jsPsych.randomization.sampleWithoutReplacement(this.settings.LARGE_LOTTERY_GOLD_COIN_PROP_RANGE_DIFF, 1)[0]
            const large_lottery_gold_coin_prop = choice_type==="harmony" ? small_lottery_gold_coin_prop+curr_trial_diff : small_lottery_gold_coin_prop-curr_trial_diff
            const gold_coin_prop = { 
                small: small_lottery_gold_coin_prop,
                large: large_lottery_gold_coin_prop
            }

            const left_lottery_type = pt_left_lottery_types[pt_trial_ind]
            const right_lottery_type = left_lottery_type == "small" ? "large" : "small"
            const left_lottery_gold_prop = gold_coin_prop[left_lottery_type]
            const right_lottery_gold_prop = gold_coin_prop[right_lottery_type]
            const left_lottery_total_coins = this.settings.LOTTERY_TOTAL_COINS[left_lottery_type]
            const right_lottery_total_coins = this.settings.LOTTERY_TOTAL_COINS[right_lottery_type]

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
                'choice_type': choice_type,
                'left_lottery_display_type': current_denominator_display_types[left_lottery_type],
                'right_lottery_display_type': current_denominator_display_types[right_lottery_type],
                'left_lottery_type': left_lottery_type,
                'right_lottery_type': right_lottery_type,
                'left_lottery_gold_prop': left_lottery_gold_prop,
                'right_lottery_gold_prop': right_lottery_gold_prop,
                'left_lottery_total_coins': left_lottery_total_coins,
                'right_lottery_total_coins': right_lottery_total_coins,
                'left_lottery_gold_coins': Math.round(left_lottery_gold_prop*left_lottery_total_coins),
                'right_lottery_gold_coins': Math.round(right_lottery_gold_prop*right_lottery_total_coins),
                'left_lottery_silver_coins': left_lottery_total_coins-Math.round(left_lottery_gold_prop*left_lottery_total_coins),
                'right_lottery_silver_coins': right_lottery_total_coins-Math.round(right_lottery_gold_prop*right_lottery_total_coins)
            }
        }
    
        // ------------------------TEST TRIALS DATA
        let curr_pp_aig_version = this.settings.USE_ANCHOR_VERSION ? 'anchor' : 'aig'
        if (this.settings.TEST_TRIALS_N > this.settings.ANCHOR_FORM_DATA[`task_version_${this.settings.TASK_VERSION}`]["left_lottery_types"].length) {
            console.error(`Incorrect settings for anchor form on ${this.prettyname} task. Proceeding with AIG form.`)
            curr_pp_aig_version = 'aig'
        }
        let left_lottery_types
        if (curr_pp_aig_version === "aig") {
            left_lottery_types = this.jsPsych.randomization.shuffle(this.Experiment.helper_funcs.expandArray(["small", "large"], this.settings.TEST_TRIALS_N/2))
        } else {
            left_lottery_types = this.settings.ANCHOR_FORM_DATA[`task_version_${this.settings.TASK_VERSION}`]["left_lottery_types"]
        }
        let denominator_display_types
        if (curr_pp_aig_version === "aig") {
            denominator_display_types = {
                conflict: this.settings.TASK_VERSION==="A" ? this.jsPsych.randomization.shuffle(this.Experiment.helper_funcs.expandArray(this.settings.DENOMINATOR_DISPLAY_TYPES.task_version_A, this.settings.TEST_TRIALS_N/8)) : this.Experiment.helper_funcs.expandArray(this.settings.DENOMINATOR_DISPLAY_TYPES.task_version_B, this.settings.TEST_TRIALS_N/2),
                harmony: this.settings.TASK_VERSION==="A" ? this.jsPsych.randomization.shuffle(this.Experiment.helper_funcs.expandArray(this.settings.DENOMINATOR_DISPLAY_TYPES.task_version_A, this.settings.TEST_TRIALS_N/8)) : this.Experiment.helper_funcs.expandArray(this.settings.DENOMINATOR_DISPLAY_TYPES.task_version_B, this.settings.TEST_TRIALS_N/2),
            }
        } else {
            denominator_display_types = this.settings.ANCHOR_FORM_DATA[`task_version_${this.settings.TASK_VERSION}`]["denominator_display_types"]
        }
        let test_trials_data = []
        for (let choice_type of this.settings.TRIAL_CHOICE_TYPES) {
            for (let small_lottery_gold_coin_prop of this.settings.SMALL_LOTTERY_GOLD_COIN_PROPS) {
                for (let large_lottery_gold_coin_prop_diff of this.settings.LARGE_LOTTERY_GOLD_COIN_PROP_RANGE_DIFF) {
                    test_trials_data.push({
                        trial_choice_type: choice_type,
                        gold_coin_prop: {
                            small: small_lottery_gold_coin_prop,
                            large: choice_type==="harmony" ? small_lottery_gold_coin_prop+large_lottery_gold_coin_prop_diff : small_lottery_gold_coin_prop-large_lottery_gold_coin_prop_diff
                        }
                    })
                }
            }
        }
        for (let s=0; s<5; s++) {test_trials_data = this.jsPsych.randomization.shuffle(test_trials_data)}
        const choice_type_counters = {
            conflict: 0,
            harmony: 0
        };
        // let left_lottery_gold_prop_arr = []
        // let right_lottery_gold_prop_arr = []
        // let left_lottery_total_coins_arr = []
        // let right_lottery_total_coins_arr = []
        for (let test_trial_ind = 0; test_trial_ind < this.settings.TEST_TRIALS_N; test_trial_ind++) {
            const left_lottery_type = left_lottery_types[test_trial_ind]
            const right_lottery_type = left_lottery_type == "small" ? "large" : "small"

            let left_lottery_gold_prop
            let right_lottery_gold_prop
            let left_lottery_total_coins
            let right_lottery_total_coins
            if (curr_pp_aig_version === "aig") {
                left_lottery_gold_prop = test_trials_data[test_trial_ind]['gold_coin_prop'][left_lottery_type]
                right_lottery_gold_prop = test_trials_data[test_trial_ind]['gold_coin_prop'][right_lottery_type]
                left_lottery_total_coins = this.settings.LOTTERY_TOTAL_COINS[left_lottery_type]
                right_lottery_total_coins = this.settings.LOTTERY_TOTAL_COINS[right_lottery_type]
            } else {
                left_lottery_gold_prop = this.settings.ANCHOR_FORM_DATA[`task_version_${this.settings.TASK_VERSION}`]["left_lottery_gold_prop"][test_trial_ind]
                right_lottery_gold_prop = this.settings.ANCHOR_FORM_DATA[`task_version_${this.settings.TASK_VERSION}`]["right_lottery_gold_prop"][test_trial_ind]
                left_lottery_total_coins = this.settings.ANCHOR_FORM_DATA[`task_version_${this.settings.TASK_VERSION}`]["left_lottery_total_coins"][test_trial_ind]
                right_lottery_total_coins = this.settings.ANCHOR_FORM_DATA[`task_version_${this.settings.TASK_VERSION}`]["right_lottery_total_coins"][test_trial_ind]
            }
            // left_lottery_gold_prop_arr.push(left_lottery_gold_prop)
            // right_lottery_gold_prop_arr.push(right_lottery_gold_prop)
            // left_lottery_total_coins_arr.push(left_lottery_total_coins)
            // right_lottery_total_coins_arr.push(right_lottery_total_coins)

            // we'll just re-calculate the choice_type properly here
            const choice_type = (left_lottery_type=="small" & left_lottery_gold_prop < right_lottery_gold_prop) || (right_lottery_type=="small" & right_lottery_gold_prop < left_lottery_gold_prop) ? "harmony" : "conflict"
            // we first use the last index of the counters to index the denominator_display_types[choice_type] and then the ++ increments it for the next iteration
            const current_denominator_display_types = denominator_display_types[choice_type][choice_type_counters[choice_type]++];

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
                'choice_type': choice_type,
                'left_lottery_display_type': current_denominator_display_types[left_lottery_type],
                'right_lottery_display_type': current_denominator_display_types[right_lottery_type],
                'left_lottery_type': left_lottery_type,
                'right_lottery_type': right_lottery_type,
                'left_lottery_gold_prop': left_lottery_gold_prop,
                'right_lottery_gold_prop': right_lottery_gold_prop,
                'left_lottery_total_coins': left_lottery_total_coins,
                'right_lottery_total_coins': right_lottery_total_coins,
                'left_lottery_gold_coins': Math.round(left_lottery_gold_prop*left_lottery_total_coins),
                'right_lottery_gold_coins': Math.round(right_lottery_gold_prop*right_lottery_total_coins),
                'left_lottery_silver_coins': left_lottery_total_coins-Math.round(left_lottery_gold_prop*left_lottery_total_coins),
                'right_lottery_silver_coins': right_lottery_total_coins-Math.round(right_lottery_gold_prop*right_lottery_total_coins)
            }
        }
        // console.log(`Left lottery types: `, left_lottery_types)
        // console.log(`Denominatory display types: `, denominator_display_types)
        // console.log(`Left lottery gold prop arr: `, left_lottery_gold_prop_arr)
        // console.log(`Right lottery gold prop arr: `, right_lottery_gold_prop_arr)
        // console.log(`Left lottery total coins arr: `, left_lottery_total_coins_arr)
        // console.log(`Right lottery total coins arr: `, right_lottery_total_coins_arr)
        
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
                let points_increment_per_ms = ((self.settings.GOLD_COINS_COUNTER - curr_points_on_screen) / time_to_update_text) * ms_per_increment
                let curr_points_tracker = parseInt(accumulated_points_text.innerHTML)
    
                let interval_id = setInterval(function() {
                    curr_points_tracker += points_increment_per_ms
                    if (curr_points_tracker >= self.settings.GOLD_COINS_COUNTER) {
                        accumulated_points_text.innerHTML = String(self.settings.GOLD_COINS_COUNTER)
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
                accumulated_points_text.innerHTML = String(self.settings.GOLD_COINS_COUNTER)
            }
        }

        self.general_instructions = {
            type: jsPsychInstructions,
            // <img style="border: 2px solid black; width: 80%" src="img/instructions/DN_v${self.settings.TASK_VERSION}_demo.png"/>
            // <img style="border: 2px solid black; width: 80%" src="img/instructions/DN_v${self.settings.TASK_VERSION}_demo.gif"/>
            pages: 
            // [`<p class="instructions-title" style="text-align: center">Lottery draw task</p>
            //         <p>In this task, there will be two lotteries that contain varying amounts of gold and silver coins.</p>
            //         <p>On each trial, you will be able to see the distribution of gold and silver coins for each lottery as shown below.</p>
            //         <p><b>Your task is</b> to maximise the number of gold coins you draw by selecting which lottery you would like the computer to draw a coin from.</p>`,

            //         `<p class="instructions-title" style="text-align: center">Lottery draw task</p>
            //         <p>After each decision, you will see feedback about your draw which will tell you if you got a gold coin or a silver one. If you did not make a deicision in time, you will see a "too slow" message. See below for a few sample trials.</p>
            //         <p>You will have <b>15 seconds to make a decision</b> by pressing either the left or the right arrow key.</p>`
            // ]
            function() {
                if (self.settings.TASK_VERSION === "A") {
                    return [`<p class="instructions-title" style="text-align: center">Lottery draw task - Version 1</p>
                            <p>In this task, you will need to make a series of choices between two lotteries.</p>
                            <p>Each lottery is represented by a combination of gold and silver coins.</p>
                            <p>Lotteries will be either represented verbally, as in</p>
                            <div style="width: 50%; margin: auto;"><img style="width: 100%; border: 2px solid black;" src="img/instructions/DN_VersionA_example_text.png"/></div>
                            <p style="text-align: center; font-weight: bold; font-size: 2em">OR</p>
                            <p>they will be represented visually, like so (also 1 gold coin out of 10):</p>
                            <div style="width: 90%; margin: auto;"><img style="width: 100%; border: 2px solid black;" src="img/instructions/DN_VersionA_example_array.png"/></div>`,

                            `<p class="instructions-title" style="text-align: center">Lottery draw task - Version 1</p>
                            <p>After each decision, you will see whether you drew a gold or silver coin.</p>
                            <p>Remember, your goal is to maximize the chance you draw a gold coin.</p>
                            <p>Press the left or right arrow key to select the option you prefer.</p>
                            <p>Here is an example of what a trial might look like:</p>
                            <div style="width: 90%; margin: auto;"><img style="width: 100%; border: 2px solid black;" src="img/instructions/DN_VersionA_demo.gif"/></div>`
                        ]
                } else if (self.settings.TASK_VERSION === "B") {
                    return [`<p class="instructions-title" style="text-align: center">Lottery draw task - Version 2</p>
                            <p>This will be very similar to the lottery task you just completed.</p>
                            <p><b>LIKE BEFORE</b>, you will make a series of choices between two lotteries, each represented by a combination of gold and silver coins. After each decision, you will see whether you drew a gold or silver coin.</p>
                            <p><b>NOW, UNLIKE BEFORE</b>, you will see information about the lotteries BOTH as text and visually.</p>
                            <p>Remember, your goal is to maximize the chance you draw a gold coin.</p>
                            <p>Here is an example of what a trial might look like:</p>
                            <div style="width: 90%; margin: auto;"><img style="width: 100%; border: 2px solid black;" src="img/instructions/DN_VersionB_demo.gif"/></div>`
                        ]
                }
            },
            show_clickable_nav: true,
            allow_backward: false,
            allow_keys: false,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 120,
            on_finish: function(data) {
                data.trial_name = "dn_general_instructions"
            }
        }
        
        self.pt_trials_instructions = {
            type: jsPsychInstructions,
            pages: [`<p class="instructions-title" style="text-align: center">Lottery draw task - Version ${self.settings.TASK_VERSION==="A" ? "1" : "2"}</p>
                    <p>You will now familiarise yourself with the task. You will complete ${self.settings.PT_TRIALS_N} practice trials.</p>
                    <p>These trials do not count towards your final score - they are designed to help you get used to the task.</p>
                    <p>Now, please <b>place your right hand on the left and right arrow keys</b>.</p>
                    <p><i>Press the <b>spacebar</b> with your left hand whenever you are ready to start!</i></p>
                    `],
            show_clickable_nav: false,
            key_forward: " ",
            allow_backward: false,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 60,
            on_finish: function(data) {
                data.trial_name = "dn_pt_trials_instructions"
            }
        }
        
        self.test_trials_instructions = {
            type: jsPsychInstructions,
            pages: function() {
                return [`<p class="instructions-title" style="text-align: center">Lottery draw task - Version ${self.settings.TASK_VERSION==="A" ? "1" : "2"}</p>
                        <p>Thank you for completing the practice trials. You managed to collect ${self.settings.GOLD_COINS_COUNTER} gold coins - these will not count towards your final score.</p>
                        <p>We will now progress to the test trials. The gold coins you now collect will count towards your final score.</p>
                        <p>Remeber that <b>your task is</b> to maximize the number of gold coins you draw.</p>
                        <p>Now, please <b>place your right hand on the left and right arrow keys</b>.</p>
                        <p><i>Press the <b>spacebar</b> with your left hand whenever you are ready to start!</i></p>
                        `]
            },
            show_clickable_nav: false,
            key_forward: " ",
            allow_backward: false,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 45,
            on_start: function(trial) {
                document.querySelector("#points_counter_value").innerHTML = "0";
                document.querySelector("#points_counter_container").style.display = "none"
            },
            on_finish: function(data) {
                self.settings.GOLD_COINS_COUNTER = 0
                data.trial_name = "dn_test_trials_instructions"
            }
        }

        self.pt_trial = {}

        function get_lottery_dimensions() {
            const container = document.querySelector('#lotteries_container');
            const size = Math.min(container.clientWidth * 0.5, container.clientHeight);
            return {width: size, height: size}
        }

        function set_content_size() {
            const size = get_lottery_dimensions().width

            document.querySelectorAll('.lottery_parent').forEach(e => {
                e.style.width = `${size}px`;
                e.style.height = `${size}px`;
                e.style['padding-bottom'] = `${size}px`;
            });
            document.querySelectorAll('.lottery_text').forEach(e => {e.style.width = `${size}px`;});
            document.querySelectorAll('#lottery_labels_container div').forEach(e => {e.style.width = `${size}px`;});
            document.querySelectorAll('.lottery_choice').forEach(e => {e.style.width = `${size}px`;});
        }

        function draw_coins() {
            const lottery_dimensions = get_lottery_dimensions()

            const coins_distribution_lottery_left = self.jsPsych.timelineVariable('left_lottery_type', true)=="large" ? {rows: 20, cols: 20} : {rows: 10, cols: 1}
            const coins_distribution_lottery_right = self.jsPsych.timelineVariable('right_lottery_type', true)=="large" ? {rows: 20, cols: 20} : {rows: 10, cols: 1}
            let lottery_left_coins_colors = [...self.Experiment.helper_funcs.expandArray(['gold'], self.jsPsych.timelineVariable('left_lottery_gold_coins', true)), ...self.Experiment.helper_funcs.expandArray(['silver'], self.jsPsych.timelineVariable('left_lottery_silver_coins', true))]
            let lottery_right_coins_colors = [...self.Experiment.helper_funcs.expandArray(['gold'], self.jsPsych.timelineVariable('right_lottery_gold_coins', true)), ...self.Experiment.helper_funcs.expandArray(['silver'], self.jsPsych.timelineVariable('right_lottery_silver_coins', true))]
            
            let max_coins = {row: Math.max(coins_distribution_lottery_left.rows, coins_distribution_lottery_right.rows),
                            col: Math.max(coins_distribution_lottery_left.cols, coins_distribution_lottery_right.cols)}
            let coin_container_size = {width: lottery_dimensions['width']*0.99/max_coins.row, height: lottery_dimensions['height']*0.99/max_coins.col}
            let coin_size = {width: coin_container_size['width']*0.9, height: coin_container_size['height']*0.9}
            let coin_margin = {width: coin_container_size['width']*0.1, height: coin_container_size['height']*0.1}

            if (self.jsPsych.timelineVariable('left_lottery_display_type', true) !== "text") {
                let lottery_left_coins_html = ''
                for (let i=0; i<lottery_left_coins_colors.length; i++) {
                    let row_offset = parseInt(i/max_coins.row)
                    let col_offset = i - (row_offset*max_coins.row)

                    let lottery_left_color = lottery_left_coins_colors[i]
                    lottery_left_coins_html += `<div class="coin" style="width: ${coin_size["width"]}px; height: ${coin_size["height"]}px; bottom: ${coin_margin["height"]+(row_offset*coin_container_size["height"])}px; left: ${coin_margin["width"]+(col_offset*coin_container_size["width"])}px; background-color: ${lottery_left_color}"></div>`
                } 
                document.getElementById("lottery_left").innerHTML += lottery_left_coins_html
            }

            if (self.jsPsych.timelineVariable('right_lottery_display_type', true) !== "text") {
                let lottery_right_coins_html = ''
                for (let i=0; i<lottery_right_coins_colors.length; i++) {
                    let row_offset = parseInt(i/coins_distribution_lottery_right.rows)
                    let col_offset = i - (row_offset*coins_distribution_lottery_right.rows)

                    let lottery_right_color = lottery_right_coins_colors[i]
                    lottery_right_coins_html += `<div class="coin" style="width: ${coin_size["width"]}px; height: ${coin_size["height"]}px; bottom: ${coin_margin["height"]+(row_offset*coin_container_size["height"])}px; left: ${coin_margin["width"]+(col_offset*coin_container_size["width"])}px; background-color: ${lottery_right_color}"></div>`
                } 
                document.getElementById("lottery_right").innerHTML += lottery_right_coins_html
            }

            let small_lottery = self.jsPsych.timelineVariable('left_lottery_type', true)=="small" ? "left" : "right"
            let small_lottery_width = coin_container_size["width"]*10 + 4
            document.querySelector(`#lottery_${small_lottery}`).style.width = `${small_lottery_width}px`
            document.querySelector(`#lottery_${small_lottery}`).style.height = `${coin_container_size["height"]+2}px`
            document.querySelector(`#lottery_${small_lottery}`).style['margin-top'] = `${(lottery_dimensions["height"]-(coin_container_size["height"]+2)-2*2)/2}px`
            document.querySelector(`#lottery_${small_lottery}`).style['left'] = `${(lottery_dimensions["width"]-small_lottery_width)/2}px`
        }

        function set_lottery_text() {
            let coins = {
                'left_gold': self.jsPsych.timelineVariable('left_lottery_gold_coins', true),
                'left_total': self.jsPsych.timelineVariable('left_lottery_total_coins', true),
                'right_gold': self.jsPsych.timelineVariable('right_lottery_gold_coins', true),
                'right_total': self.jsPsych.timelineVariable('right_lottery_total_coins', true)
            }
            let plurals = {
                'left_gold': self.jsPsych.timelineVariable('left_lottery_gold_coins', true) > 1 ? 's' : '',
                // 'left_total': self.jsPsych.timelineVariable('left_lottery_total_coins', true)  > 1 ? 's' : '',
                'right_gold': self.jsPsych.timelineVariable('right_lottery_gold_coins', true)  > 1 ? 's' : ''
                // 'right_total': self.jsPsych.timelineVariable('right_lottery_total_coins', true)  > 1 ? 's' : ''
            }
            
            if (self.jsPsych.timelineVariable('left_lottery_display_type', true) !== "array") {
                document.querySelector("#lottery_left_text").innerHTML = `${coins["left_gold"]} gold coin${plurals["left_gold"]} out of ${coins["left_total"]}`
            }
            if (self.jsPsych.timelineVariable('right_lottery_display_type', true) !== "array") {
                document.querySelector("#lottery_right_text").innerHTML = `${coins["right_gold"]} gold coin${plurals["right_gold"]} out of ${coins["right_total"]}`
            }
        } 

        self.test_trial = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function() {
                return `<div id="lottery_labels_container">
                            <div>Lottery 1</div>
                            <div>Lottery 2</div>
                        </div>
                        <div id="lottery_text_desc_container">
                            <div id="lottery_left_text" class="lottery_text"></div>
                            <div id="lottery_right_text" class="lottery_text"></div>
                        </div>
                        <div id="lotteries_container">
                            <div id="lottery_left_parent" class="lottery_parent" ${self.jsPsych.timelineVariable('left_lottery_display_type', true) === "text" ? "style='visibility: hidden'" : ""}">
                                <div id="lottery_left" class="lottery"></div>
                            </div>
                            <div id="lottery_right_parent" class="lottery_parent" ${self.jsPsych.timelineVariable('right_lottery_display_type', true) === "text" ? "style='visibility: hidden'" : ""}">
                                <div id="lottery_right" class="lottery"></div>
                            </div>
                        </div>
                        <div id="lottery_choices">
                            <div class="lottery_choice"><span>Draw from Lottery 1</span><br><span><i>left arrow</i></span></div>
                            <div class="lottery_choice"><span>Draw from Lottery 2</span><br><span><i>right arrow</i></span></div>
                        </div>
                `
            },
            on_load: function() {               
                function render_dynamic_content() {
                    set_content_size()
                    draw_coins()
                }
                set_lottery_text()
                render_dynamic_content();
                window.addEventListener('resize', render_dynamic_content);

                if (self.jsPsych.timelineVariable('trial') === 0) {document.querySelector("#points_counter_container").style.display = "flex"}                
            },
            css_classes: ['content_size'],
            choices: ['arrowleft', 'arrowright'],
            trial_duration: null,//self.Experiment.settings.SIMULATE ? self.Experiment.settings.SIMULATE_TRIAL_DURATION*2 : self.settings.TRIAL_TIME_LIMIT,
            timer: 15,
            on_finish: function(data) {
                data.trial_name = "dn_main_trial_version_A"
                data.pt_trial = self.jsPsych.timelineVariable('pt_trial')
                data.block = self.jsPsych.timelineVariable('block')
                data.trial = self.jsPsych.timelineVariable('trial')
                data.task_version = self.settings.TASK_VERSION
                data.choice_type = self.jsPsych.timelineVariable('choice_type')
                data.left_lottery_display_type = self.jsPsych.timelineVariable('left_lottery_display_type')
                data.right_lottery_display_type = self.jsPsych.timelineVariable('right_lottery_display_type')
                data.left_lottery_type = self.jsPsych.timelineVariable('left_lottery_type')
                data.right_lottery_type = self.jsPsych.timelineVariable('right_lottery_type')
                data.left_lottery_gold_prop = self.jsPsych.timelineVariable('left_lottery_gold_prop')
                data.right_lottery_gold_prop = self.jsPsych.timelineVariable('right_lottery_gold_prop')
                data.left_lottery_total_coins = self.jsPsych.timelineVariable('left_lottery_total_coins')
                data.right_lottery_total_coins = self.jsPsych.timelineVariable('right_lottery_total_coins')
                data.left_lottery_gold_coins = self.jsPsych.timelineVariable('left_lottery_gold_coins')
                data.right_lottery_gold_coins = self.jsPsych.timelineVariable('right_lottery_gold_coins')
                data.left_lottery_silver_coins = self.jsPsych.timelineVariable('left_lottery_silver_coins')
                data.right_lottery_silver_coins = self.jsPsych.timelineVariable('right_lottery_silver_coins')

                data.selected_lottery = data.response === "arrowleft" ? "left" : (data.response === "arrowright" ? "right" : null)
                if (data.selected_lottery !== null) {
                    let selected_prop = self.jsPsych.timelineVariable(`${data.selected_lottery}_lottery_gold_prop`)
                    data.coin_drawn = self.jsPsych.randomization.sampleBernoulli(selected_prop) ? "gold" : "silver"
                } else {
                    data.coin_drawn = null
                }
            },
            simulation_options: 'denominator_neglect'
        }

        self.test_trial_feedback = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function() {
                // if (self.jsPsych.data.get().last(1).values()[0]['rt'] === null) {
                if (typeof self.jsPsych.data.get().last(1).values()[0]['rt'] === "undefined") {
                    return '<p style="font-size: 3em; color: red;">X<br><br>TOO SLOW</p>'
                } else {
                    let coin_drawn = self.jsPsych.data.get().last(1).values()[0]['coin_drawn']
                    if (coin_drawn === "gold") {
                        self.settings.GOLD_COINS_COUNTER += 1
                        update_reward_points(!self.Experiment.settings.SIMULATE)
                        return `<p style="font-size: 3em; color: gold; line-height: 2em;">You drew a <b>gold coin</b>.</p>`
                    } else if (coin_drawn === "silver") {
                        return `<p style="font-size: 3em; color: white; line-height: 2em;">You drew a <b>silver coin</b>.</p>`
                    }
                }
            },
            choices: "NO_KEYS",
            trial_duration: self.Experiment.settings.SIMULATE === true ? self.Experiment.settings.SIMULATE_TRIAL_DURATION : 1000,
            on_finish: function(data) {
                data.trial_name = "dn_trial_feedback"

                if (!self.jsPsych.timelineVariable('pt_trial') && self.jsPsych.timelineVariable('trial')===self.settings.TEST_TRIALS_N-1) {
                    document.querySelector("#points_counter_value").innerHTML = "0";
                    document.querySelector("#points_counter_container").style.display = "none"
                }
            }
        }
    }

    get_timeline() {
        let timeline = []
        if (this.Experiment.saved_progress.data_checkpoints.includes(`${this.prettyname}__completed`)) {
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
        } else {
            timeline.push(this.Experiment.trial_generators.wait_for_media_load(this))
            timeline.push(this.Experiment.trial_generators.add_task_stylesheet("denominator_neglect_task"))
            if (this.Experiment.settings.INSTRUCTIONS_ONLY) {
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Denominator Neglect - instructions'], show_clickable_nav: true})
                timeline.push(this.general_instructions)
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Denominator Neglect - practice trials intro'], show_clickable_nav: true})
                timeline.push(this.pt_trials_instructions)
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Denominator Neglect - test trials intro'], show_clickable_nav: true})
                timeline.push(this.test_trials_instructions)
            } else {
                const pt_trials_timeline = this.Experiment.helper_funcs.get_task_trials_timeline_with_interblock_text(
                    [this.Experiment.trial_generators.fixation_cross(), this.test_trial, this.test_trial_feedback],
                    this.settings.PT_BLOCKS, 
                    null, //optional interblock timeline 
                    this.task_data.pt_trials,
                    'pt')
                const test_trials_timeline = this.Experiment.helper_funcs.get_task_trials_timeline_with_interblock_text(
                    [this.Experiment.trial_generators.fixation_cross(), this.test_trial, this.test_trial_feedback], 
                    this.settings.TEST_BLOCKS, 
                    null, //optional interblock timeline
                    this.task_data.test_trials,
                    'test')
                timeline.push(this.general_instructions)
                timeline.push(this.Experiment.hide_progress_bar())
                timeline.push(this.pt_trials_instructions)
                timeline.push(pt_trials_timeline)
                timeline.push(this.test_trials_instructions)
                timeline.push(test_trials_timeline)
            }
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
            timeline.push(this.Experiment.trial_generators.get_task_feedback(this.prettyname))
            timeline.push(this.Experiment.trial_generators.remove_task_stylesheet("denominator_neglect_task"))
            timeline.push(this.Experiment.trial_generators.exclusion_timeline(this.exclusion_criteria))
            timeline.push(this.Experiment.trial_generators.async_data_save(`${this.prettyname}__completed`))
        }
        return {timeline: timeline}
    }
}