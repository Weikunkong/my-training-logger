/********* 登录处理 *********/
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if(username === "kwk" && password === "123456") {
      // 登录成功：隐藏登录页面，显示主应用页面
      document.getElementById("loginView").classList.add("hidden");
      document.getElementById("app").classList.remove("hidden");
    } else {
      // 登录失败：显示错误提示
      document.getElementById("loginError").style.display = "block";
    }
  });
  
  /********* 全局配置与记忆数据 *********/
  const startMonday = new Date("2025-01-27"); // 第一总体周的周一日期
  const totalCycles = 8; // 每个周期4周，共32周
  
  // weekCompletion：保存各总体周（周一～周六）的任务完成状态（任务的唯一ID）
  // chartData：保存图表数据（记录周一、周二、周三动作“8次”重量数据）
  // completedWeeks：保存已锁定的总体周（数字）
  let weekCompletion = {};
  let chartData = {};
  let completedWeeks = [];
  
  // 从 localStorage 加载数据
  function loadData() {
    let storedCompletion = localStorage.getItem("weekCompletion");
    if (storedCompletion) {
      const temp = JSON.parse(storedCompletion);
      for (let key in temp) {
        weekCompletion[key] = new Set(temp[key]);
      }
    }
    let storedChart = localStorage.getItem("chartData");
    if (storedChart) {
      chartData = JSON.parse(storedChart);
    }
    let storedWeeks = localStorage.getItem("completedWeeks");
    if (storedWeeks) {
      completedWeeks = JSON.parse(storedWeeks);
    }
  }
  
  // 保存数据到 localStorage
  function saveData() {
    let temp = {};
    for (let key in weekCompletion) {
      temp[key] = Array.from(weekCompletion[key]);
    }
    localStorage.setItem("weekCompletion", JSON.stringify(temp));
    localStorage.setItem("chartData", JSON.stringify(chartData));
    localStorage.setItem("completedWeeks", JSON.stringify(completedWeeks));
  }
  
  /********* 训练计划数据 *********/
  const schedule = {
    "周一": [
      {
        muscleGroup: "胸部",
        exercises: [
          {
            name: "卧推",
            sets: [
              { weight: 50, reps: "12" },
              { weight: 52.5, reps: "10" },
              { weight: 60, reps: "8+3", red: true },
              { weight: 65, reps: "6" },
              { weight: 70, reps: "4" }
            ],
            progression: { weightIncrement: 2.5, type: "linear" }
          }
        ]
      },
      {
        muscleGroup: "长头肌",
        exercises: [
          {
            name: "长头肌训练",
            sets: [
              { weight: 10, reps: "12" },
              { weight: 12, reps: "10" },
              { weight: 13, reps: "8+3", red: true },
              { weight: 14, reps: "6" },
              { weight: 15, reps: "4" }
            ],
            progression: { weightIncrement: 1, type: "linear" }
          }
        ]
      }
    ],
    "周二": [
      {
        muscleGroup: "背部",
        exercises: [
          {
            name: "引体向上",
            setsByCycle: [
              [
                { weight: 42, reps: "12" },
                { weight: 35, reps: "10" },
                { weight: 27.5, reps: "8+3", red: true },
                { weight: 20, reps: "6" },
                { weight: 12.5, reps: "4" }
              ],
              [
                { weight: 35, reps: "12" },
                { weight: 27.5, reps: "10" },
                { weight: 20, reps: "8+3", red: true },
                { weight: 12.5, reps: "6" },
                { weight: 5,  reps: "4" }
              ],
              [
                { weight: 27.5, reps: "12" },
                { weight: 20, reps: "10" },
                { weight: 12.5, reps: "8" },
                { weight: 5,    reps: "6" },
                { weight: 5,    reps: "4" }
              ]
            ],
            progression: { custom: true }
          },
          {
            name: "单臂划船",
            sets: [
              { weight: 50, reps: "12" },
              { weight: 57.5, reps: "10" },
              { weight: 65, reps: "8+3", red: true },
              { weight: 72.5, reps: "6" },
              { weight: 80, reps: "4" }
            ],
            progression: { weightIncrement: 7.5, type: "linear" }
          },
          {
            name: "高位下拉",
            sets: [
              { weight: 20, reps: "12" },
              { weight: 25, reps: "10" },
              { weight: 30, reps: "8+3", red: true },
              { weight: 35, reps: "6" },
              { weight: 40, reps: "4" }
            ],
            progression: { weightIncrement: 5, type: "linear" }
          }
        ]
      },
      {
        muscleGroup: "二头肌",
        exercises: [
          {
            name: "二头肌训练",
            sets: [
              { weight: 8, reps: "12" },
              { weight: 10, reps: "10" },
              { weight: 12, reps: "8+3", red: true },
              { weight: 14, reps: "6" },
              { weight: 16, reps: "4" }
            ],
            progression: { weightIncrement: 2, type: "linear" }
          }
        ]
      }
    ],
    "周三": [
      {
        muscleGroup: "肩部-前束",
        exercises: [
          {
            name: "哑铃推举",
            sets: [
              { weight: 12.5, reps: "12" },
              { weight: 14, reps: "10" },
              { weight: 16, reps: "8+3", red: true },
              { weight: 18, reps: "6" },
              { weight: 20, reps: "4" }
            ],
            progression: { weightIncrement: 2, type: "linear" }
          }
        ]
      },
      {
        muscleGroup: "肩部-中束",
        exercises: [
          {
            name: "侧平举",
            sets: [
              { weight: 6, reps: "12" },
              { weight: 8, reps: "10" },
              { weight: 10, reps: "8" }
            ],
            progression: { weightIncrement: 2, type: "linear" }
          },
          {
            name: "中束固定器械",
            sets: [
              { weight: 25, reps: "12" },
              { weight: 30, reps: "10" },
              { weight: 35, reps: "8+3", red: true },
              { weight: 40, reps: "6" },
              { weight: 45, reps: "4" }
            ],
            progression: { weightIncrement: 5, type: "linear" }
          }
        ]
      },
      {
        muscleGroup: "肩部-后束",
        exercises: [
          {
            name: "固定器械反向飞鸟",
            sets: [
              { weight: 5, reps: "12" },
              { weight: 10, reps: "10" },
              { weight: 15, reps: "8+3", red: true },
              { weight: 20, reps: "6" },
              { weight: 25, reps: "4" }
            ],
            progression: { weightIncrement: 5, type: "linear" }
          }
        ]
      }
    ],
    "周四": [
      {
        muscleGroup: "背部",
        exercises: [
          {
            name: "引体向上",
            setsByCycle: [
              [
                { weight: 42, reps: "12" },
                { weight: 35, reps: "10" },
                { weight: 27.5, reps: "8+3", red: true },
                { weight: 20, reps: "6" },
                { weight: 12.5, reps: "4" }
              ],
              [
                { weight: 35, reps: "12" },
                { weight: 27.5, reps: "10" },
                { weight: 20, reps: "8" },
                { weight: 12.5, reps: "6+3", red: true },
                { weight: 5,  reps: "4" }
              ]
            ],
            progression: { custom: true }
          },
          {
            name: "单臂划船",
            sets: [
              { weight: 50, reps: "12" },
              { weight: 57.5, reps: "10" },
              { weight: 65, reps: "8" },
              { weight: 72.5, reps: "6+3", red: true },
              { weight: 80, reps: "4" }
            ],
            progression: { weightIncrement: 7.5, type: "linear" }
          },
          {
            name: "高位下拉",
            sets: [
              { weight: 20, reps: "12" },
              { weight: 25, reps: "10" },
              { weight: 30, reps: "8+3", red: true },
              { weight: 35, reps: "6" },
              { weight: 40, reps: "4" }
            ],
            progression: { weightIncrement: 5, type: "linear" }
          }
        ]
      },
      {
        muscleGroup: "二头肌",
        exercises: [
          {
            name: "二头肌训练",
            sets: [
              { weight: 8, reps: "12" },
              { weight: 10, reps: "10" },
              { weight: 12, reps: "8" },
              { weight: 14, reps: "6+3", red: true },
              { weight: 16, reps: "4" }
            ],
            progression: { weightIncrement: 2, type: "linear" }
          }
        ]
      }
    ],
    "周五": [
      {
        muscleGroup: "胸部",
        exercises: [
          {
            name: "卧推",
            sets: [
              { weight: 50, reps: "12" },
              { weight: 52.5, reps: "10" },
              { weight: 60, reps: "8" },
              { weight: 65, reps: "6+3", red: true },
              { weight: 70, reps: "4" }
            ],
            progression: { weightIncrement: 2.5, type: "linear" }
          }
        ]
      },
      {
        muscleGroup: "长头肌",
        exercises: [
          {
            name: "长头肌训练",
            sets: [
              { weight: 10, reps: "12" },
              { weight: 12, reps: "10" },
              { weight: 13, reps: "8" },
              { weight: 14, reps: "6+3", red: true },
              { weight: 15, reps: "4" }
            ],
            progression: { weightIncrement: 1, type: "linear" }
          }
        ]
      }
    ],
    "周六": [
      {
        muscleGroup: "肩部-前束",
        exercises: [
          {
            name: "哑铃推举",
            sets: [
              { weight: 12.5, reps: "12" },
              { weight: 14, reps: "10" },
              { weight: 16, reps: "8" },
              { weight: 18, reps: "6+3", red: true },
              { weight: 20, reps: "4" }
            ],
            progression: { weightIncrement: 2, type: "linear" }
          }
        ]
      },
      {
        muscleGroup: "肩部-中束",
        exercises: [
          {
            name: "侧平举",
            sets: [
              { weight: 6, reps: "12" },
              { weight: 8, reps: "10" },
              { weight: 10, reps: "8" }
            ],
            progression: { weightIncrement: 2, type: "linear" }
          },
          {
            name: "中束固定器械",
            sets: [
              { weight: 12.5, reps: "12" },
              { weight: 20, reps: "10" },
              { weight: 27.5, reps: "8+3", red: true },
              { weight: 35, reps: "6+3", red: true },
              { weight: 42.5, reps: "4" }
            ],
            progression: { weightIncrement: 7.5, type: "linear" }
          }
        ]
      },
      {
        muscleGroup: "肩部-后束",
        exercises: [
          {
            name: "固定器械反向飞鸟",
            sets: [
              { weight: 50, reps: "12" },
              { weight: 57.5, reps: "10" },
              { weight: 65, reps: "6+3", red: true },
              { weight: 72.5, reps: "6" },
              { weight: 80, reps: "4" }
            ],
            progression: { weightIncrement: 7.5, type: "linear" }
          }
        ]
      }
    ]
  };
  
  /********* 辅助函数 *********/
  function applyLinearProgression(baseWeight, increment, nowWeek) {
    const effectiveCycle = Math.floor((nowWeek - 1) / 4);
    return baseWeight + increment * effectiveCycle;
  }
  
  function formatDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  }
  
  const dayOffsets = {
    "周一": 0,
    "周二": 1,
    "周三": 2,
    "周四": 3,
    "周五": 4,
    "周六": 5
  };
  
  function getEightRepWeight(exercise, nowWeek) {
    let weight = 0;
    if (exercise.sets) {
      let set = exercise.sets[2];
      if (exercise.progression && exercise.progression.type === "linear") {
        weight = applyLinearProgression(set.weight, exercise.progression.weightIncrement, nowWeek);
      } else {
        weight = set.weight;
      }
    } else if (exercise.setsByCycle) {
      if (nowWeek <= exercise.setsByCycle.length) {
        let set = exercise.setsByCycle[nowWeek - 1][2];
        weight = set.weight;
      } else if (exercise.progression && exercise.progression.custom) {
        const baseCycle = exercise.setsByCycle.length;
        let lastSet = exercise.setsByCycle[baseCycle - 1][2];
        weight = lastSet.weight + 2.5 * (nowWeek - baseCycle);
      }
    }
    return weight;
  }
  
  /********* 统计与锁定 *********/
  // 计算整周（周一～周六）的任务总数
  function calculateTotalWeekExercises() {
    let count = 0;
    const days = ["周一", "周二", "周三", "周四", "周五", "周六"];
    days.forEach(day => {
      if (schedule[day]) {
        schedule[day].forEach(group => {
          count += group.exercises.length;
        });
      }
    });
    return count;
  }
  let totalWeekExercises = calculateTotalWeekExercises();
  
  function updateSelectOptions() {
    const cycleSelect = document.getElementById("cycleSelect");
    const weekSelect = document.getElementById("weekSelect");
    // 更新 cycleSelect：检查该周期下的4个总体周（整周）的任务是否全部完成
    for (let i = 0; i < cycleSelect.options.length; i++) {
      const opt = cycleSelect.options[i];
      const cycleNum = parseInt(opt.value);
      let allWeeksComplete = true;
      for (let w = 1; w <= 4; w++) {
        let overall = (cycleNum - 1) * 4 + w;
        if (!weekCompletion[overall] || weekCompletion[overall].size < totalWeekExercises) {
          allWeeksComplete = false;
          break;
        }
      }
      if (allWeeksComplete) {
        opt.disabled = true;
        opt.style.color = "grey";
      } else {
        opt.disabled = false;
        opt.style.color = "";
      }
    }
    // 更新 weekSelect：针对当前周期内的每一周检查任务是否全部完成
    const currentCycle = parseInt(cycleSelect.value);
    for (let i = 0; i < weekSelect.options.length; i++) {
      const opt = weekSelect.options[i];
      const weekNum = i + 1;
      let overall = (currentCycle - 1) * 4 + weekNum;
      if (weekCompletion[overall] && weekCompletion[overall].size === totalWeekExercises) {
        opt.disabled = true;
        opt.style.color = "grey";
      } else {
        opt.disabled = false;
        opt.style.color = "";
      }
    }
  }
  
  /********* 图表处理 *********/
  let chartInstance = null;
  function updateChartForWeek(overallWeek) {
    if (completedWeeks.includes(overallWeek)) return;
    const days = ["周一", "周二", "周三"];
    days.forEach(day => {
      if (!schedule[day]) return;
      schedule[day].forEach((group, groupIndex) => {
        group.exercises.forEach((exercise, exIndex) => {
          const exerciseId = `${day}_${groupIndex}_${exIndex}`;
          const weight = getEightRepWeight(exercise, overallWeek);
          if (!chartData[exerciseId]) {
            chartData[exerciseId] = { label: exercise.name, data: [] };
          }
          chartData[exerciseId].data.push(weight);
        });
      });
    });
    completedWeeks.push(overallWeek);
    completedWeeks.sort((a, b) => a - b);
    saveData();
    updateChartInstance();
  }
  
  function initChart() {
    const ctx = document.getElementById("chartCanvas").getContext("2d");
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: completedWeeks.map(w => "第" + w + "周"),
        datasets: Object.keys(chartData).map(key => {
          return {
            label: chartData[key].label,
            data: chartData[key].data,
            fill: false,
            borderColor: getRandomColor(),
            tension: 0.1
          };
        })
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: '8次重量曲线' }
        },
        scales: {
          x: { title: { display: true, text: '总体周' } },
          y: { title: { display: true, text: '重量 (kg)' } }
        }
      }
    });
  }
  
  function updateChartInstance() {
    if (!chartInstance) return;
    chartInstance.data.labels = completedWeeks.map(w => "第" + w + "周");
    chartInstance.data.datasets = Object.keys(chartData).map(key => {
      return {
        label: chartData[key].label,
        data: chartData[key].data,
        fill: false,
        borderColor: getRandomColor(),
        tension: 0.1
      };
    });
    chartInstance.update();
  }
  
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  /********* 任务区渲染 *********/
  function renderSchedule() {
    const cycle = parseInt(document.getElementById("cycleSelect").value);
    const week = parseInt(document.getElementById("weekSelect").value);
    const overallWeek = (cycle - 1) * 4 + week;
    
    if (!weekCompletion[overallWeek]) {
      weekCompletion[overallWeek] = new Set();
    }
    
    const container = document.getElementById("scheduleContainer");
    container.innerHTML = "";
    const mondayDate = new Date(startMonday.getTime() + (overallWeek - 1) * 7 * 24 * 60 * 60 * 1000);
    
    for (const day in schedule) {
      const dayOffset = dayOffsets[day] || 0;
      const currentDate = new Date(mondayDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const dayDiv = document.createElement("div");
      dayDiv.className = "day";
      const dayHeader = document.createElement("h2");
      dayHeader.textContent = `${day} - ${formatDate(currentDate)}`;
      dayDiv.appendChild(dayHeader);
      
      schedule[day].forEach((group, groupIndex) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "muscle-group";
        const groupHeader = document.createElement("h3");
        groupHeader.textContent = group.muscleGroup;
        groupDiv.appendChild(groupHeader);
        
        group.exercises.forEach((exercise, exIndex) => {
          const exerciseId = `${day}_${groupIndex}_${exIndex}`;
          const exerciseDiv = document.createElement("div");
          exerciseDiv.className = "exercise";
          const exerciseHeader = document.createElement("h4");
          exerciseHeader.textContent = exercise.name;
          exerciseDiv.appendChild(exerciseHeader);
          
          let sets = [];
          if (exercise.sets) {
            sets = exercise.sets.map(set => {
              let newWeight = set.weight;
              if (exercise.progression && exercise.progression.type === "linear") {
                newWeight = applyLinearProgression(set.weight, exercise.progression.weightIncrement, overallWeek);
              }
              return {
                weight: newWeight,
                reps: set.reps,
                red: set.red || (set.reps && set.reps.indexOf("+3") !== -1)
              };
            });
          } else if (exercise.setsByCycle) {
            if (overallWeek <= exercise.setsByCycle.length) {
              sets = exercise.setsByCycle[overallWeek - 1];
            } else if (exercise.progression && exercise.progression.custom) {
              const baseCycle = exercise.setsByCycle.length;
              const repsArr = ["12", "10", "8", "6", "4"];
              sets = [0, 2.5, 5, 7.5, 10].map((base, i) => {
                return {
                  weight: base + 2.5 * (overallWeek - baseCycle),
                  reps: repsArr[i],
                  red: false
                };
              });
            }
          }
          sets.forEach((set, idx) => {
            const setDiv = document.createElement("div");
            setDiv.className = "set";
            if (set.red) { setDiv.classList.add("red"); }
            setDiv.textContent = `Set ${idx + 1}: ${set.weight}kg ${set.reps}次`;
            exerciseDiv.appendChild(setDiv);
          });
          
          const completeBtn = document.createElement("button");
          if (weekCompletion[overallWeek].has(exerciseId)) {
            completeBtn.textContent = "已完成";
            completeBtn.disabled = true;
            exerciseDiv.classList.add("completed");
          } else {
            completeBtn.textContent = "完成";
            completeBtn.addEventListener("click", function() {
              weekCompletion[overallWeek].add(exerciseId);
              completeBtn.textContent = "已完成";
              completeBtn.disabled = true;
              exerciseDiv.classList.add("completed");
              saveData();
              if (weekCompletion[overallWeek].size === totalWeekExercises) {
                updateSelectOptions();
                alert(`总体第 ${overallWeek} 周（对应本周期中的第 ${week} 周）的【周一到周六】任务均完成，该周已锁定。`);
                updateChartForWeek(overallWeek);
              }
            });
          }
          exerciseDiv.appendChild(completeBtn);
          groupDiv.appendChild(exerciseDiv);
        });
        dayDiv.appendChild(groupDiv);
      });
      container.appendChild(dayDiv);
    }
  }
  
  /********* 切换视图 *********/
  function switchView(view) {
    const taskView = document.getElementById("taskView");
    const chartView = document.getElementById("chartView");
    if (view === "task") {
      taskView.classList.remove("hidden");
      chartView.classList.add("hidden");
    } else if (view === "chart") {
      chartView.classList.remove("hidden");
      taskView.classList.add("hidden");
      updateChartInstance();
    }
  }
  
  /********* 重置功能 *********/
  function resetData() {
    if (confirm("确定要重置所有数据吗？此操作将清除所有任务记录、图表数据和锁定状态，无法撤销。")) {
      localStorage.removeItem("weekCompletion");
      localStorage.removeItem("chartData");
      localStorage.removeItem("completedWeeks");
      weekCompletion = {};
      chartData = {};
      completedWeeks = [];
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      initChart();
      updateSelectOptions();
      renderSchedule();
      alert("数据已重置。");
    }
  }
  
  /********* 页面初始化与事件绑定 *********/
  window.onload = function() {
    loadData();
    initChart();
    updateSelectOptions();
    renderSchedule();
  };
  document.getElementById("cycleSelect").addEventListener("change", function() {
    updateSelectOptions();
    renderSchedule();
  });
  document.getElementById("weekSelect").addEventListener("change", function() {
    updateSelectOptions();
    renderSchedule();
  });
  document.getElementById("btnTaskView").addEventListener("click", function() {
    switchView("task");
  });
  document.getElementById("btnChartView").addEventListener("click", function() {
    switchView("chart");
  });
  document.getElementById("btnReset").addEventListener("click", function() {
    resetData();
  });
  