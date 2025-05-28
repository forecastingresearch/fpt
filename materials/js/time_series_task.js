export default class Time_Series {
    constructor(jsPsych, Experiment, task_query_string) {
        this.duration_mins = 6
        this.prettyname = "Time series"
        this.browser_requirements = {min_width: 840,min_height: 500,mobile_allowed: false}
        this.media = ['img/instructions/time_series_instructions_1.png', 'img/instructions/time_series_instructions_2.png', 'img/instructions/time_series_demo.gif']
        this.media_promises = []
        this.exclusion_criteria = []
        
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
                variable: 'USE_ANCHOR_VERSION',
                query_shortcode: 'uav',
                prettyname: 'Use ANCHOR version',
                input_type: 'checkbox'
            },
            {
                variable: 'SHOW_CONDITIONS_DURING_TRIAL',
                query_shortcode: 'scdt',
                prettyname: 'Show conditions during a trial',
                input_type: 'checkbox'
            }
        ]
        return modifiable_settings
    }

    get_default_settings() {
        let settings = {}
        settings.SHOW_TASK = true
        settings.TASK_ORDER_INDEX = -999
        settings.USE_ANCHOR_VERSION = false

        settings.SHOW_CONDITIONS_DURING_TRIAL = false

        // settings.FUNCTIONS = ['autocorrelated', 'linear', 'exponential']
        settings.FUNCTIONS = ['linear', 'exponential']
        settings.DIRECTIONS = ['positive', 'negative']
        settings.DATAPOINTS = ['datapoints_10', 'datapoints_30']
        // noise is defined as a % of the chart's height
        // if the graph's height is 650px, then the low noise is 12px and high is 40px (as per R&H, 2011)
        settings.NOISE = {'low': 1.9,'high': 6.2}
        settings.GRAPHS_PER_CONDITION = 1
        settings.ANCHOR_FORM_DATA = {
            'linear': {
                'positive': {
                    'low': {
                        'datapoints_10': [0.34115646248517334,0.3765395963783339,0.41148386836173906,0.4117070833034764,0.4245283116045815,0.4753310333455402,0.4749335161868271,0.4980801567854018,0.5143743105934254,0.5286114342894821],
                        'datapoints_30': [0.338051731602363,0.3330257970415612,0.34990643982570696,0.3979156270866805,0.355689274819715,0.34816674552343596,0.40406685317028546,0.38590977337132687,0.41922055537368047,0.4765739333645901,0.42841743430686363,0.4362982076669584,0.47231727377421956,0.4528003399052783,0.4496266411732442,0.49608090368255164,0.49319350814736423,0.5117788815213205,0.5156466493494118,0.5585570378987667,0.5358246251249943,0.541924887935256,0.5543337833614204,0.5635950245334594,0.5681304645109535,0.5614204669246843,0.5904859654214949,0.5642960698750855,0.5922175800106475,0.6398378802217878]
                    },
                    'high': {
                        'datapoints_10': [0.3910651988152279,0.5001735157154249,0.372034728100275,0.42193653557865374,0.43539846748011984,0.5200555752383477,0.4170994696352142,0.40503546912348154,0.5561447290289464,0.4960282903363501],
                        'datapoints_30': [0.41626054968638876,0.25066251581351967,0.381156495748144,0.349562532733616,0.510153650795019,0.339661787310495,0.4019933261362406,0.36243629029303204,0.3765627455985965,0.4593813531417261,0.5198357837381841,0.40603015360278655,0.4684453450834761,0.5897437499177423,0.450371746474618,0.5158147173364359,0.5336132261002206,0.44791032746270565,0.4508809239246617,0.5917479215382393,0.4901734512667722,0.5476594803776252,0.6307875890314759,0.5930112760214684,0.5352278922026753,0.5988256774646287,0.6547198502347084,0.5145539563355018,0.5278100708497258,0.7449872122868164]
                    }
                },
                'negative': {
                    'low': {
                        'datapoints_10': [0.6087786075359396,0.620716853029249,0.6309761140310952,0.5941634258185463,0.5627129105896425,0.5472028595105919,0.5037909638897444,0.4675677679254043,0.4811522817986201,0.43958475350742887],
                        'datapoints_30': [0.6885822942966768,0.6502837860608616,0.6367476440991809,0.6377750012701976,0.6417527406762048,0.6296076326482521,0.6065806483043996,0.5805709254266851,0.5774647850088399,0.5532169536354858,0.5428188959717446,0.5571208318188385,0.5461532657172055,0.5448971084638943,0.5287641858849222,0.5650457981974911,0.49805215397468156,0.5033596031451419,0.4888152623064473,0.4808595153134056,0.5038264284385694,0.45214978386302207,0.46192195316419066,0.4481170989935159,0.4402132201576863,0.3974208828685908,0.40085244408829807,0.3983862279646233,0.38108939410245546,0.37664401123159275]
                    },
                    'high': {
                        'datapoints_10': [0.6301439381807655,0.661310277813274,0.6631348248481685,0.5872813536995066,0.5547447985406625,0.5695707257948328,0.46485870207149854,0.41355924054023274,0.4074709182218148,0.46207247099328397],
                        'datapoints_30': [0.7359247187703974,0.6351347347828641,0.6076095307298874,0.7773840379134429,0.5082857640815118,0.6614273620293092,0.6113649502321331,0.4760175344300979,0.5979632421126583,0.5219008329317101,0.49887119006199426,0.6103586804853446,0.5088013481346669,0.4377218077004442,0.5639118329076132,0.509926059675878,0.5059401033813838,0.4584966214013728,0.4947524848657233,0.5103622231729921,0.3903616082943801,0.46723432258625175,0.3934592137103292,0.4404351835794895,0.4175107811092834,0.38539274585641986,0.46595249215046525,0.37101818133864667,0.3569895078268806,0.3956897469697056]
                    }
                }
            },
            'exponential': {
                'positive': {
                    'low': {
                        'datapoints_10': [0.16327880613062648,0.17919633843797567,0.20086653529989587,0.16594616203369358,0.15480130361244376,0.22729587449385674,0.2063177237827766,0.2440793700193259,0.2223991099298123,0.20674450167934375],
                        'datapoints_30': [0.17647811589242068,0.1603888088372734,0.1477877654557926,0.1775083817152591,0.17324895609425814,0.17301279294104024,0.16295305024394047,0.1750497487883282,0.19812998720511388,0.18906599399132654,0.17252961059388225,0.21832054272630838,0.20061604773056066,0.21569035107441945,0.20221454893750868,0.2009511294680771,0.21999349387537173,0.17708222732738416,0.2053371245448363,0.21637890765706,0.22766517895814004,0.22006021673673412,0.25474252792874297,0.2674734308825046,0.27041795782760764,0.31032172922091905,0.3344974269154627,0.33850899275175783,0.36165343416949214,0.40410400073144787]
                    },
                    'high': {
                        'datapoints_10': [0.06065827664244287,0.22071900323405075,0.16688139034169605,0.28332876766443726,0.03427619555277513,0.08574335795303059,0.2692281041484615,0.17364257640101796,0.28796378251934207,0.2608566412631452],
                        'datapoints_30': [0.1254212488649957,0.22866215686106964,0.26116605199804915,0.1710209597256598,0.23320414363863287,0.09432676099845087,0.23817090216054937,0.1484221599860525,0.15358893589671854,0.18131223318747147,0.15689859878264795,0.2577764389898848,0.28704631852392704,0.13325377052556156,0.2097607163644799,0.15948041490921971,0.16401082332631733,0.11228041315179328,0.26590148797585544,0.2813661409063391,0.08043178051581819,0.21265852655231593,0.22471849368306346,0.1399815260596115,0.2544974396118038,0.241562820088657,0.3715004252837194,0.2683482605373099,0.44893473999690475,0.4071352583842313]
                    }
                },
                'negative': {
                    'low': {
                        'datapoints_10': [0.8402470799341831,0.8154394141387136,0.8411997693411258,0.8783061607941451,0.822693604419397,0.8479348631216604,0.8077093837573802,0.8040987465184901,0.7764925191372092,0.7489861748357005],
                        'datapoints_30': [0.8521123879858051,0.8056244530851355,0.8093902656656589,0.8220544022679095,0.8536675799887886,0.8525003303012049,0.7877281742557164,0.8239260784597999,0.8412809844330105,0.830988817395726,0.8109986585455291,0.7929587654587164,0.8189014935721824,0.8313514502253465,0.8144436910523647,0.8147318308145435,0.7962645384441192,0.803333459941442,0.7724455368626252,0.8172619210944719,0.7749234991079835,0.7681810197037903,0.7218062421124365,0.7655162510397878,0.7206214309684988,0.706872668084013,0.6905002492951642,0.6973890974970073,0.6412480410663757,0.5754222737767506]
                    },
                    'high': {
                        'datapoints_10': [0.7213755576743069,0.8036732544863568,0.8103833413370698,0.8581014356289604,0.7955857886080576,0.8448640740157202,0.8113051077741686,0.8156735549765426,0.8421875514777433,0.6889628793220086],
                        'datapoints_30': [0.8527186887443308,0.7036501880122192,0.8651743937852913,0.8262859816767401,0.791006301962607,0.7817727682042899,0.9323171010354779,0.8647724825161771,0.8161633827818311,0.7828265343984723,0.8678140810636351,0.812950748462958,0.7418850418837353,0.8065368221167815,0.8216400497937552,0.8779964134361811,0.7734438000176441,0.8948327194769748,0.8032712465061811,0.7118788023578041,0.7984076894186631,0.765173320675403,0.7590687570763885,0.6852489670606751,0.7750919276105943,0.6039266338107293,0.6972955357912693,0.6645281146989682,0.7105921648610939,0.5278501585705928]
                    }
                }
            }
        }

        settings.PT_TRIALS_N = 4
        settings.PT_TRIALS_PER_BLOCK = 4
        settings.PT_BLOCKS = settings.PT_TRIALS_N / settings.PT_TRIALS_PER_BLOCK
        settings.TEST_TRIALS_N = settings.FUNCTIONS.length*settings.DIRECTIONS.length*Object.keys(settings.NOISE).length*settings.DATAPOINTS.length*settings.GRAPHS_PER_CONDITION
        settings.TEST_TRIALS_PER_BLOCK = settings.TEST_TRIALS_N
        settings.TEST_BLOCKS = settings.TEST_TRIALS_N / settings.TEST_TRIALS_PER_BLOCK

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
        for (let pt_trial_ind = 0; pt_trial_ind < this.settings.PT_TRIALS_N; pt_trial_ind++) {	    
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
                'function': this.jsPsych.randomization.sampleWithoutReplacement(this.settings.FUNCTIONS, 1)[0],
                'direction': this.jsPsych.randomization.sampleWithoutReplacement(this.settings.DIRECTIONS, 1)[0],
                'noise_condition': this.jsPsych.randomization.sampleWithoutReplacement(Object.keys(this.settings.NOISE), 1)[0],
                'datapoints': this.jsPsych.randomization.sampleWithoutReplacement(this.settings.DATAPOINTS, 1)[0],
                'aig_version': 'aig',
                'y_axis_values_relative_to_chart_height': null
            }
        }
    
        // ------------------------TEST TRIALS DATA
        let curr_pp_aig_version = this.settings.USE_ANCHOR_VERSION ? 'anchor' : 'aig'
        if (this.settings.GRAPHS_PER_CONDITION !== 1) {
            console.error(`Incorrect settings for anchor form on ${this.prettyname} task. Proceeding with AIG form.`)
            curr_pp_aig_version = 'aig'
        }
        let all_trials_data = []
        for (let func of this.settings.FUNCTIONS) {
            for (let dir of this.settings.DIRECTIONS) {
                for (let noise_condition of Object.keys(this.settings.NOISE)) {
                    for (let datapoints of this.settings.DATAPOINTS) {
                        for (let i=0; i<this.settings.GRAPHS_PER_CONDITION; i++) {
                            all_trials_data.push({
                                function: func,
                                direction: dir,
                                noise_condition: noise_condition,
                                datapoints: datapoints,
                                aig_version: curr_pp_aig_version,
                                y_axis_values_relative_to_chart_height: curr_pp_aig_version==='anchor' ? this.settings.ANCHOR_FORM_DATA[func][dir][noise_condition][datapoints] : null
                            })
                        }
                    }
                }
            }
        }
        for (let s=0; s<5; s++) {all_trials_data = this.jsPsych.randomization.shuffle(all_trials_data)}
        for (let test_trial_ind = 0; test_trial_ind < this.settings.TEST_TRIALS_N; test_trial_ind++) {
    
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
                'function': all_trials_data[test_trial_ind].function,
                'direction': all_trials_data[test_trial_ind].direction,
                'noise_condition': all_trials_data[test_trial_ind].noise_condition,
                'datapoints': all_trials_data[test_trial_ind].datapoints,
                'aig_version': all_trials_data[test_trial_ind].aig_version,
                'y_axis_values_relative_to_chart_height': all_trials_data[test_trial_ind].y_axis_values_relative_to_chart_height
            }
        }
        return task_data
    }

    define_trials() {
        // it's quite common to refer to both the current trial context so this causes context conflict for the this keyword
        // therefore, for this method we will use self to refer to the class and this will be for whatever the current context is
        let self = this;

        function sample_linear_model(x_axis_values, chart_height, noise_condition, direction) {
            let final_x = x_axis_values.length % 10 == 0 ? 
                            x_axis_values.length+6 : 
                            x_axis_values.length        
            let noise_sd = Object.keys(self.settings.NOISE).includes(noise_condition) ? chart_height*(self.settings.NOISE[noise_condition]/100) : 0
            
            let constant = direction=="positive" ? chart_height/3 : chart_height*2/3
            let limit_at_final_x = direction==="positive" ? chart_height*2/3 : chart_height/3
            let slope = direction==="positive" ?
                        (limit_at_final_x-constant) / final_x :
                        -(constant-limit_at_final_x) / final_x

            let y_axis_values = []
            for (let x of x_axis_values) {
                let noise = self.jsPsych.randomization.sampleNormal(0, noise_sd)
                let y = constant + (slope*x) + noise
                y_axis_values.push(y)
            }
            return y_axis_values
        }

        function sample_expontential_model(x_axis_values, chart_height, noise_condition, direction) {
            let final_x = x_axis_values.length % 10 == 0 ? 
                            x_axis_values.length+6 : 
                            x_axis_values.length
            let noise_sd = Object.keys(self.settings.NOISE).includes(noise_condition) ? chart_height*(self.settings.NOISE[noise_condition]/100) : 0
            
            let constant = direction==="positive" ? chart_height/6 : chart_height*5/6
            let limit_at_final_x = direction==="positive" ? chart_height*5/6 : chart_height/6

            let base = direction==="positive" ?
                        (limit_at_final_x-constant) ** (1/final_x) :
                        (constant-limit_at_final_x) ** (1/final_x)

            let y_axis_values = []
            for (let x of x_axis_values) {
                let noise = self.jsPsych.randomization.sampleNormal(0, noise_sd)
                let y = direction == "positive" ? 
                            constant + (base**x) + noise : 
                            constant - (base**x) + noise;
                y_axis_values.push(y)
            }
            return y_axis_values
        }

        function get_y_axis_values_aig(chart_height, x_axis_values, func, direction, noise_condition) {
            let y_axis_values = []
            if (func=='linear') {
                y_axis_values = sample_linear_model(x_axis_values.slice(0,-6), chart_height, noise_condition, direction)
            } else if (func=='exponential') {
                y_axis_values = sample_expontential_model(x_axis_values.slice(0,-6), chart_height, noise_condition, direction)
            }
            y_axis_values = y_axis_values.map(y => {
                if (y>chart_height) {return chart_height}
                if (y<0) {return 0}
                return y
            })
            // console.log(y_axis_values)
            return y_axis_values
        }

        function simulate_chart_click(xPoint, chartInstance, delay=0) {
            self.jsPsych.pluginAPI.setTimeout(() => {
                const canvasRect = chartInstance.canvas.getBoundingClientRect();
            
                const xValue = Math.round(chartInstance.scales.x.getPixelForValue(xPoint));
                const yValue = Math.random() * chartInstance.chartArea.height;
            
                const clickEvent = new MouseEvent('click', {
                    clientX: xValue + canvasRect.left,
                    clientY: yValue + canvasRect.top,
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
            
                chartInstance.canvas.dispatchEvent(clickEvent);
            }, delay)
        }

        self.general_instructions = {
            type: jsPsychInstructions,
            pages: [`<p class="instructions-title" style="text-align: center">Predict the next point on the graph</p>
                    <p>In this task, you will be in the role of a forecaster making predictions based on historical trends. However, we are not going to tell you the specific topic the prediction is about. We will show you past historical data.</p>
                    <p>In each case, the pattern is based on an underlying trend that can be inferred from the observed data points. The x-axis represents time and the y-axis the corresponding value.</p>
                    <p>Your task is to extrapolate from the existing trend and guess what the y-axis values should be for the missing 6 points. To do this, please click on the blue lines where the y-axis values are initially missing to fill them.</p>
                    <p>Proceed to the next page to see an example.</p>`,
                
                    `<p class="instructions-title" style="text-align: center">Predict the next point on the graph</p>
                    <p>In the example below you can see 30 points of data. These are based on an underlying trend.</p>
                    <p>Your job during the test trials will be to predict the next six datapoints based on your interpretation of this trend. To do so, <b>you can click on the graph at the points where you predict the next six points will be</b>.</p>
                    <p>Your score for this task will be based on how close your predictions are to the actual underlying trend. Note that you will not receive immediate feedback on this part of the test, but we will tell you your score and its percentile rank in a follow-up score report.</p>
                    <div style="width: 90%; margin: auto;"><img style="width: 100%; border: 2px solid black;" src="img/instructions/time_series_instructions_1.png"/></div>`],
            show_clickable_nav: true,
            allow_backward: false,
            allow_keys: false,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 180,
            on_finish: function(data) {
                data.trial_name = "time_series_general_instructions"
            }
        }
        
        self.pt_trials_instructions = {
            type: jsPsychInstructions,
            pages: [`<p class="instructions-title" style="text-align: center">Predict the next point on the graph</p>
                    <p>The previous example was only a demonstration. You will now complete ${self.settings.PT_TRIALS_N} practice items. These will not count towards your score.</p>
                    <p>These items will vary in difficulty in several ways. For example, in some trials, we will give you 30 datapoints to infer the trend from, while in others we will give you only 10.</p>
                    <p>Please proceed to the next page to complete the practice items.</p>
                    `],
            show_clickable_nav: true,
            allow_backward: false,
            allow_keys: false,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 20,
            on_finish: function(data) {
                data.trial_name = "time_series_pt_trials_instructions"
            }
        }
        
        self.test_trials_instructions = {
            type: jsPsychInstructions,
            pages: [`<p class="instructions-title" style="text-align: center">Predict the next point on the graph</p>
                    <p>You will now progress to the test items. There will be ${self.settings.TEST_TRIALS_N} test items.</p>
                    <p>Remeber that <b>your task is</b> to figure out the trend based on the existing datapoints, and predict the next six datapoints.</p>
                    `],
            show_clickable_nav: true,
            allow_backward: false,
            allow_keys: false,
            css_classes: ['instructions_width', 'instructions_left_align'],
            timer: 30,
            on_finish: function(data) {
                data.trial_name = "time_series_test_trials_instructions"
            }
        }

        self.pt_trial = {}

        self.test_trial = {
            type: jsPsychHtmlButtonResponse,
            stimulus: function() {	
                let html = `<canvas id="myChart"></canvas>`
                if (self.settings.SHOW_CONDITIONS_DURING_TRIAL) {
                    html += `<p style="position: absolute; top: -1%; left: 50%; transform: translate(-50%)">
                                <b>function</b>: ${self.jsPsych.timelineVariable('function')}; 
                                <b>direction</b>: ${self.jsPsych.timelineVariable('direction')}; 
                                <b>noise</b>: ${self.jsPsych.timelineVariable('noise_condition')} 
                            </p>`
                }
                return html
            },
            on_load: function() {
                let that = this;

                document.querySelector("#jspsych-html-button-response-stimulus").style.height="100%"
                const continue_button = document.querySelector(".jspsych-btn")
                if (!self.Experiment.settings.IGNORE_VALIDATION) {continue_button.style.visibility = "hidden";}

                const canvas = document.getElementById('myChart');
                const ctx = canvas.getContext('2d');

                const x_axis_values = self.Experiment.helper_funcs.range(1, parseInt(self.jsPsych.timelineVariable('datapoints').split("_")[1])+6, 1)
                
                const data = {
                    labels: x_axis_values,
                    datasets: [{
                        data: [],
                        borderColor: 'black',
                        pointStyle: 'circle',
                        pointRadius: 4,
                        pointBackgroundColor: 'orange'
                    }]
                };

                const config = {
                    type: 'line',
                    data: data,
                    // plugins: [{
                    // 	afterLayout: (chart) => {
                    // 		// const chartHeight = chart.chartArea.bottom - chart.chartArea.top;
                    // 		// chart.options.scales.y.max = chartHeight;
                    // 		// can't call chart.update() here as otherwise after every update, the afterLayout executes again, leading to recursion
                    // 		// chart.update();
                    // 	}
                    // }],
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        onClick: null,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                enabled: false
                            }
                        },
                        scales: {
                            x: {
                                grid: {
                                    color: (context) => {
                                        const xAxisIndicesToColor = self.Experiment.helper_funcs.range(data.labels.length-6, data.labels.length, 1);
                                        if (xAxisIndicesToColor.includes(context.tick.value)) {
                                            return 'blue';
                                        }
                                        return 'rgba(0, 0, 0, 0.1)';
                                    }
                                }
                            },
                            y: {
                                min: 0,
                                ticks: {
                                    display: false,
                                    callback: function (value) {
                                        return Math.round(value) + 'px';
                                    }
                                },
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                };

                const chart = new Chart(ctx, config);
                that.data.chart_height = chart.chartArea.height
                chart.options.scales.y.max = chart.chartArea.height

                let y_axis_values = self.jsPsych.timelineVariable('y_axis_values_relative_to_chart_height') !== null ?
                                        self.jsPsych.timelineVariable('y_axis_values_relative_to_chart_height').map(e=>e*chart.chartArea.height) : 
                                        get_y_axis_values_aig(chart.chartArea.height, 
                                                                x_axis_values, 
                                                                self.jsPsych.timelineVariable('function'), 
                                                                self.jsPsych.timelineVariable('direction'), 
                                                                self.jsPsych.timelineVariable('noise_condition'))
                
                // use the next 2 lines to udpate the anchor form
                // let y_axis_values_relative_to_chart_height = y_axis_values.map(e=>e/chart.chartArea.height)
                // console.log(self.jsPsych.timelineVariable('function'), self.jsPsych.timelineVariable('direction'), self.jsPsych.timelineVariable('noise_condition'), self.jsPsych.timelineVariable('datapoints'), y_axis_values_relative_to_chart_height)
                // not sure why but this saves not only the pre-defined values but also the newly selected ones (though those are saved as strings via toFixed(2) below)
                that.data.y_axis_values = y_axis_values

                data.datasets[0].data = y_axis_values
                // use the next few lines to create images/gifs for the instructions
                // self.jsPsych.randomization.setSeed(124)
                // for (let i=0; i<x_axis_values.length-6; i++) {
                //     let random_noise = self.jsPsych.randomization.sampleNormal(0, 25)
                //     data.datasets[0].data.push(chart.chartArea.height/2+random_noise)
                // }
                // data.datasets.push({data: Array(x_axis_values.length).fill(chart.chartArea.height/2), borderColor: 'green', fill: false})
                chart.update()

                // Set the onClick function after creating the chart instance
                chart.options.onClick = (event, elements) => {
                    const x = event.x;
                    const y = event.y;

                    const xValue = Math.round(chart.scales.x.getValueForPixel(x));
                    const yValue = chart.scales.y.getValueForPixel(y);

                    if (!self.Experiment.helper_funcs.range(data.labels.length-6, data.labels.length, 1).includes(xValue)) return // prevent adding points at certin x-axis values

                    data.datasets[0].data[xValue] = yValue.toFixed(2);
                    chart.update();

                    let show_continue_button = true
                    for (let x of self.Experiment.helper_funcs.range(data.labels.length-6, data.labels.length, 1)) {
                        if (data.datasets[0].data[x-1]===undefined) {
                            show_continue_button = false
                        }
                    }
                    if (show_continue_button) {continue_button.style.visibility = "visible"}
                }
                if (self.Experiment.settings.SIMULATE) {
                    continue_button.style.visibility = "visible"                    
                    let n_points_to_select = self.Experiment.simulation_options[this.simulation_options].data().n_points_to_select
                    let x_axis_points_to_select = self.jsPsych.randomization.sampleWithoutReplacement(self.Experiment.helper_funcs.range(x_axis_values.length-6, x_axis_values.length-1, 1), n_points_to_select)
                    x_axis_points_to_select.sort()
                    for (let i=0; i<x_axis_points_to_select.length; i++) {
                        simulate_chart_click(x_axis_points_to_select[i], chart, i * self.Experiment.settings.SIMULATE_TRIAL_DURATION/6);
                    }
                }
            },
            data: {y_axis_values: null, chart_height: null},
            choices: ['Continue'],
            // trial_duration: null,
            css_classes: ['chart_size'],
            timer: 20,
            on_finish: function(data) {
                data.trial_name = "time_series_trial"
                data.pt_trial = self.jsPsych.timelineVariable("pt_trial")
                data.block = self.jsPsych.timelineVariable("block")
                data.trial = self.jsPsych.timelineVariable("trial")
                data.func = self.jsPsych.timelineVariable("function")
                data.direction = self.jsPsych.timelineVariable("direction")
                data.noise_condition = self.jsPsych.timelineVariable("noise_condition")
                data.datapoints = self.jsPsych.timelineVariable("datapoints")
            },
            simulation_options: 'time_series'
        }
    }

    get_timeline() {
        let timeline = []
        if (this.Experiment.saved_progress.data_checkpoints.includes(`${this.prettyname}__completed`)) {
            timeline.push(this.Experiment.update_progress_bar(this.duration_mins))
        } else {
            timeline.push(this.Experiment.trial_generators.wait_for_media_load(this))
            timeline.push(this.Experiment.trial_generators.add_task_stylesheet("time_series_task"))
            if (this.Experiment.settings.INSTRUCTIONS_ONLY) {
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Time series task - instructions'], show_clickable_nav: true})
                timeline.push(this.general_instructions)
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Time series task - practice trials intro'], show_clickable_nav: true})
                timeline.push(this.pt_trials_instructions)
                timeline.push({type: jsPsychInstructions, pages: ['SIGNPOST: Time series task - test trials intro'], show_clickable_nav: true})
                timeline.push(this.test_trials_instructions)
            } else {
                const pt_trials_timeline = this.Experiment.helper_funcs.get_task_trials_timeline_with_interblock_text(
                    [this.test_trial], 
                    this.settings.PT_BLOCKS, 
                    null, //optional interblock timeline 
                    this.task_data.pt_trials,
                    'pt')
                const test_trials_timeline = this.Experiment.helper_funcs.get_task_trials_timeline_with_interblock_text(
                    [this.test_trial], 
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
            timeline.push(this.Experiment.trial_generators.remove_task_stylesheet("time_series_task"))
            timeline.push(this.Experiment.trial_generators.exclusion_timeline(this.exclusion_criteria))
            timeline.push(this.Experiment.trial_generators.async_data_save(`${this.prettyname}__completed`))
        }
        return {timeline: timeline}
    }
}