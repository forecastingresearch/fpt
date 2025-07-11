export default class ADMC_Decision_Rules {
    constructor(jsPsych, Experiment, task_query_string) {
        this.duration_mins = 3
        this.prettyname = "ADMC Decision Rules"
        this.browser_requirements = {min_width: 840, min_height: 500, mobile_allowed: false}
        this.media = ['img/instructions/DR_example_1.png', 'img/instructions/DR_example_2.png', 'img/instructions/DR_example_3.png']
        this.media_promises = []
        this.exclusion_criteria = []
        
        this.jsPsych = jsPsych;
        this.Experiment = Experiment;

        this.modifiable_settings = this.get_modifiable_settings();
        this.default_settings = this.get_default_settings();
        this.settings = this.get_updated_settings_from_query(task_query_string);
        // this.task_data = this.get_task_data();
        this.set_admc_content();
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
            }
        ]
        return modifiable_settings
    }

    get_default_settings() {
        let settings = {}
        settings.SHOW_TASK = true
        settings.TASK_ORDER_INDEX = -999
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

    // get_task_data() {
    //     // each value for pt_trials and test_trials is an object, whose keys are the trial key (trial_001)
    //     // and values are objects with key-value pairs representing curr trial variable name-curr trial variable value
    //     // e.g. {'test_trials': 
    //     //			 {'trial_001': {
    //     //			 	'pt_trial': true, 
    //     //			 	'block': 0,
    //     //			 	'trial': 5,
    //     //			 	'myvar': 'myval'
    //     //			 }, 'trial_002': {...}}}
    //     const task_data = {'pt_trials': {}, 'test_trials': {}} 
    //     return task_data
    // }

    define_trials() {
        // it's quite common to refer to both the current trial context so this causes context conflict for the this keyword
        // therefore, for this method we will use self to refer to the class and this will be for whatever the current context is
        let self = this;

        this.dr_instructions = {
            type: jsPsychInstructions,
            pages: [
                `<u><b>Instructions</b></u><br>Please read the practice problems on this page carefully before going on to the problems on the next page.
                <p>Imagine Chris is going to buy a TV with the $369 he received for his birthday. He wants to find out how the TVs that are available for that price compare to each other. A magazine rated TVs on each of five features as follows, where higher is better:</p>
                <div class="admc-dr-numbers-desc-container">
                    <div>Very Low<br>1</div>
                    <div>Low<br>2</div>
                    <div>Medium<br>3</div>
                    <div>High<br>4</div>
                    <div>Very High<br>5</div>
                </div>
                <p>For example, two TVs and their ratings are listed in the table below:</p>
                <table>
                    <tr>
                        <th></th>
                        <th>Picture Quality</th>
                        <th>Sound Quality</th>
                        <th>Programming Options</th>
                        <th>Reliability of Brand</th>
                        <th>Price</th>
                    </tr>
                    <tr>
                        <td>A</td>
                        <td>2</td>
                        <td>2</td>
                        <td>5</td>
                        <td>4</td>
                        <td>$369</td>
                    </tr>
                    <tr style="background-color: #f2f2f2;">
                        <td>B</td>
                        <td>2</td>
                        <td>3</td>
                        <td>3</td>
                        <td>3</td>
                        <td>$369</td>
                    </tr>
                </table>
                <p><b>The following examples use the table above. Please read each carefully.</b></p>
                <p><u>Example 1.</u> Chris selects the TV with the highest rating in Programming Options.</p>
                <p>Which <b><u>one</b></u> of the presented TVs would Chris prefer?</p>
                <div><img class="dr_instructions_img" src="img/instructions/DR_example_1.png"/></div>
                <p><u>Example 2.</u> Chris only wants a TV with a sound quality that is rated higher than 4.</p>
                <p>Which <b><u>one</b></u> of the presented TVs would Chris prefer?</p>
                <div><img class="dr_instructions_img" src="img/instructions/DR_example_2.png"/></div>
                <p><u>Example 3.</u> Chris only wants the best in Picture Quality.</p>
                <p>Which <b><u>two</b></u> of the presented TVs would Chris prefer?</p>
                <div><img class="dr_instructions_img" src="img/instructions/DR_example_3.png"/></div>`,
        
                `The following questions are about other people choosing between TVs, like the ones before. <b>Please read each question carefully, because they ask for different answers.</b> For each question, think about how each person makes their choice, then pick the TV they choose. But be careful, because the TVs will change from question to question.`
            ],
            show_clickable_nav: true,
            allow_backward: true,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 180,
            on_finish: function(data) {
                data.trial_name = "admc_dr_instructions"
            }
        }

        self.dr_trial = {
            type: jsPsychSurveyMultiSelect,
            questions: function() {
                return [{
                    prompt: `
                        <div class="admc-dr-numbers-desc-container">
                            <div>Very Low<br>1</div>
                            <div>Low<br>2</div>
                            <div>Medium<br>3</div>
                            <div>High<br>4</div>
                            <div>Very High<br>5</div>
                        </div>
                        <p style="text-align: left"><b>Question ${self.jsPsych.timelineVariable('id').slice(2)}:</b></p>
                        <table>
                            <tr>
                                <th></th>
                                <th>Picture Quality</th>
                                <th>Sound Quality</th>
                                <th>Programming Options</th>
                                <th>Reliability of Brand</th>
                                <th>Price</th>
                            </tr>
                            <tr>
                                <td>A</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[0][0]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[0][1]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[0][2]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[0][3]}</td>
                                <td>$369</td>
                            </tr>
                            <tr>
                                <td>B</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[1][0]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[1][1]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[1][2]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[1][3]}</td>
                                <td>$369</td>
                            </tr>
                            <tr>
                                <td>C</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[2][0]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[2][1]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[2][2]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[2][3]}</td>
                                <td>$369</td>
                            </tr>
                            <tr>
                                <td>D</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[3][0]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[3][1]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[3][2]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[3][3]}</td>
                                <td>$369</td>
                            </tr>
                            <tr>
                                <td>E</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[4][0]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[4][1]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[4][2]}</td>
                                <td>${self.jsPsych.timelineVariable('table_numbers')[4][3]}</td>
                                <td>$369</td>
                            </tr>
                        </table>
                        <p style="text-align: left">${self.jsPsych.timelineVariable('problem_description')}</p>
                        <p style="text-align: left">${self.jsPsych.timelineVariable('question')}</p>`,
                    options: ['A', 'B', 'C', 'D', 'E', 'None'],
                    horizontal: true,
                    required: false,
                    name: self.jsPsych.timelineVariable('id')
                }]
            },
            on_load: function() {
                if (!(self.Experiment.settings.IGNORE_VALIDATION === true)) {
                    let next_button = document.querySelector("#jspsych-survey-multi-select-next")
                    next_button.disabled = true;
        
                    let all_checkboxes = document.querySelectorAll(`#jspsych-content input[type="checkbox"]`)
        
                    const max_checked = self.jsPsych.timelineVariable('correct_answers').length
                    all_checkboxes.forEach(checkbox => {
                        checkbox.addEventListener('change', () => {
                            const checked_checkboxes = document.querySelectorAll('#jspsych-content input[type="checkbox"]:checked');
                            if (checked_checkboxes.length >= max_checked) {
                                all_checkboxes.forEach(unchecked => {
                                    if (!unchecked.checked) {
                                        unchecked.disabled = true;
                                    }
                                });
                                next_button.disabled = false;
                            } else {
                                all_checkboxes.forEach(unchecked => {
                                    unchecked.disabled = false;
                                });
                                next_button.disabled = true;
                            }
                        });
                    });
                }
            },
            timer: 45,
            on_finish: function(data) {
                data.trial_name = "admc_dr_trial"
                data.admc_id = self.jsPsych.timelineVariable('id')
                data.admc_response = data.response==null ? null : self.jsPsych.timelineVariable('correct_answers').filter(e => Object.values(data.response)[0].includes(e)).length;
            },
            simulation_options: 'admc_dr_trial'
        }
    }

    get_timeline() {
        let timeline = []
        if (this.Experiment.saved_progress.data_checkpoints.includes(`${this.prettyname}__completed`)) {
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
        } else {
            timeline.push(this.Experiment.trial_generators.wait_for_media_load(this))
            timeline.push(this.Experiment.trial_generators.add_task_stylesheet("admc_task"))
            if (this.Experiment.settings.INSTRUCTIONS_ONLY) {
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: ADMC DR instructions'], show_clickable_nav: true})
                timeline.push(this.dr_instructions)
            } else {
                timeline.push(this.dr_instructions)
                timeline.push(this.Experiment.hide_progress_bar())
                timeline.push({timeline: [this.dr_trial], timeline_variables: this.settings.DR_ITEMS})
            }
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
            timeline.push(this.Experiment.trial_generators.get_task_feedback(this.prettyname))
            timeline.push(this.Experiment.trial_generators.remove_task_stylesheet("admc_task"))
            timeline.push(this.Experiment.trial_generators.exclusion_timeline(this.exclusion_criteria))
            timeline.push(this.Experiment.trial_generators.async_data_save(`${this.prettyname}__completed`))
        }
        return {timeline: timeline}
    }

    set_admc_content() {
        this.settings.DR_ITEMS = [
            {
                id: 'dr1', correct_answers: ['C'],
                table_numbers: [
                    [5, 4, 2, 1],
                    [5, 5, 3, 3],
                    [5, 2, 4, 4],
                    [1, 5, 5, 3],
                    [4, 5, 1, 1]
                ],
                problem_description: `Brian selects the TV with the highest number of ratings greater than "Medium".`, 
                question: `Which <b><u>one</u></b> of the presented TVs would Brian prefer?`
            },
            {
                id: 'dr2', correct_answers: ['D'], 
                table_numbers: [
                    [2, 5, 5, 5],
                    [5, 4, 4, 5],
                    [5, 3, 2, 5],
                    [3, 5, 2, 2],
                    [4, 4, 4, 5]
                ],
                problem_description: `Sally first selects the TVs with the best Sound Quality. From the selected TVs, she then selects the best on Picture Quality. Then, if there is still more than one left to choose from, she selects the one best on Programming Options.`, 
                question: `Which <b><u>one</u></b> of the presented TVs would Sally prefer?`
            },
            {
                id: 'dr3', correct_answers: ['C'], 
                table_numbers: [
                    [3, 1, 2, 5],
                    [5, 5, 3, 2],
                    [4, 3, 3, 3],
                    [5, 5, 5, 4],
                    [2, 5, 4, 4]
                ],
                problem_description: `Pat doesn't want to read through the entire table. He decides to read the table row by row until he finds the very first TV that has no ratings below "Medium." He will just choose that TV.`, 
                question: `Which <b><u>one</u></b> of the presented TVs would Pat prefer?`
            },
            {
                id: 'dr4', correct_answers: ['None'], 
                table_numbers: [
                    [3, 5, 5, 1],
                    [1, 2, 1, 2],
                    [5, 5, 4, 4],
                    [5, 3, 4, 2],
                    [4, 5, 2, 2]
                ],
                problem_description: `LaToya only wants a TV that got a "Very High" rating on Reliability of Brand.`, 
                question: `Which <b><u>one</u></b> of the presented TVs would LaToya prefer?`
            },
            {
                id: 'dr5', correct_answers: ['A'], 
                table_numbers: [
                    [5, 5, 5, 3],
                    [3, 5, 4, 5],
                    [5, 2, 2, 4],
                    [5, 1, 2, 5],
                    [4, 2, 4, 5]
                ],
                problem_description: `From the TVs with the best available Picture Quality, Tricia selects the TVs with the lowest number of ratings below "Medium." If there is more than one TV left to choose from, she then picks the one that has the best rating on "Reliability of Brand."`, 
                question: `Which <b><u>one</u></b> of the presented TVs would Tricia prefer?`
            },
            {
                id: 'dr6', correct_answers: ['E'], 
                table_numbers: [
                    [3, 1, 5, 2],
                    [1, 2, 1, 2],
                    [5, 4, 3, 1],
                    [4, 2, 3, 3],
                    [4, 4, 2, 4]
                ],
                problem_description: `Lisa wants the TV with the highest average rating across features.`, 
                question: `Which <b><u>one</u></b> of the presented TVs would Lisa prefer?`
            },
            {
                id: 'dr7', correct_answers: ['E'], 
                table_numbers: [
                    [5, 3, 5, 5],
                    [2, 5, 4, 1],
                    [4, 5, 2, 3],
                    [3, 5, 3, 1],
                    [3, 5, 3, 4]
                ],
                problem_description: `Andy wants the TV with the highest average rating he can get while still making sure to keep the best rating on Sound Quality.`, 
                question: `Which <b><u>one</u></b> of the presented TVs would Andy prefer?`
            },
            {
                id: 'dr8', correct_answers: ['A', 'C'], 
                table_numbers: [
                    [5, 4, 5, 3],
                    [5, 4, 1, 2],
                    [3, 3, 5, 5],
                    [5, 5, 1, 2],
                    [3, 5, 1, 3]
                ],
                problem_description: `Shane wants no TVs that score below "Medium" on Picture Quality, no TVs that score below "Medium" on Sound Quality, and no TVs that score "Very Low" on any other feature.`, 
                question: `Which <b><u>two</u></b> of the presented TVs would Shane prefer?`
            },
            {
                id: 'dr9', correct_answers: ['A', 'D', 'E'], 
                table_numbers: [
                    [2, 1, 5, 2],
                    [1, 5, 4, 2],
                    [5, 3, 1, 1],
                    [5, 4, 5, 4],
                    [3, 3, 3, 3]
                ],
                problem_description: `Tyrone wants a TV that either has a "Very High" rating for Programming Options, or one that scores at least “Medium" on every feature.`, 
                question: `Which <b><u>three</u></b> of the presented TVs would Tyrone prefer?`
            },
            {
                id: 'dr10', correct_answers: ['C', 'D', 'E'], 
                table_numbers: [
                    [2, 1, 5, 4],
                    [4, 5, 1, 3],
                    [1, 3, 5, 5],
                    [4, 2, 5, 4],
                    [5, 5, 1, 3]
                ],
                problem_description: `Julie wants the best Reliability of Brand, but is willing to give up one point on Reliability of Brand for each increase of at least two points in the rating of Picture Quality. She isn't concerned about the other features.`, 
                question: `Which <b><u>three</u></b> of the presented TVs would Julie prefer?`
            }
        ]
    }
}