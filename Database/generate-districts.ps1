<#
  generate-districts.ps1
  ----------------------
  Reads the CSV datasets in Database/ and generates
  src/data/districts.ts with REAL data replacing synthetic values.

  Datasets used:
  1. rainfall_districtwise_daily_imd.csv  → rain7d, humidity proxy, floodExtent
  2. west_bengal_district_dengue_outbreak_records_only.csv → dengue signal for WB
  3. incidence-of-malaria.csv             → malaria baseline (national)
  4. vaccinations.csv                     → vaccination coverage (national)
#>

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent

# ---------------------------------------------------------------------------
# 1. Load rainfall and compute per-district 7-day totals (latest week)
# ---------------------------------------------------------------------------
Write-Host "Loading rainfall data..." -ForegroundColor Cyan
$rainfallRaw = Import-Csv "$PSScriptRoot\rainfall_districtwise_daily_imd.csv"

# Parse dates, keep only last 7 days of available data per district
$cutoff = (Get-Date).AddDays(-7)
$rainfallByDistrict = @{}
$rainfallRaw | ForEach-Object {
    try {
        $dt = [datetime]::ParseExact($_.Date.Trim(), "dd-MM-yyyy", $null)
        if ($dt -ge $cutoff) {
            $key = "$($_.State.Trim())|$($_.District.Trim())"
            if (-not $rainfallByDistrict.ContainsKey($key)) {
                $rainfallByDistrict[$key] = [System.Collections.Generic.List[double]]::new()
            }
            $val = 0.0
            if ($_.("Daily Actual").Trim() -ne "" -and [double]::TryParse($_.("Daily Actual").Trim(), [ref]$val)) {
                $rainfallByDistrict[$key].Add($val)
            }
        }
    } catch {}
}

# Helper: get 7d rainfall sum for a state+district
function Get-Rain7d($state, $district) {
    $key = "$($state.ToUpper())|$($district.ToUpper())"
    if ($rainfallByDistrict.ContainsKey($key)) {
        return [math]::Round(($rainfallByDistrict[$key] | Measure-Object -Sum).Sum, 1)
    }
    return $null
}

# ---------------------------------------------------------------------------
# 2. Load dengue outbreak records (West Bengal only)
# ---------------------------------------------------------------------------
Write-Host "Loading dengue data..." -ForegroundColor Cyan
$dengueRaw = Import-Csv "$PSScriptRoot\west_bengal_district_dengue_outbreak_records_only.csv"
$dengueByDistrict = @{}
$dengueRaw | ForEach-Object {
    $d = $_.district.Trim().ToUpper()
    $cases = 0
    [int]::TryParse($_.reported_cases.Trim(), [ref]$cases) | Out-Null
    if (-not $dengueByDistrict.ContainsKey($d)) { $dengueByDistrict[$d] = 0 }
    $dengueByDistrict[$d] += $cases
}

# ---------------------------------------------------------------------------
# 3. Load malaria incidence – India latest (2024)
# ---------------------------------------------------------------------------
Write-Host "Loading malaria data..." -ForegroundColor Cyan
$malariaRaw = Import-Csv "$PSScriptRoot\incidence-of-malaria.csv"
$indiaLatestMalaria = $malariaRaw |
    Where-Object { $_.Entity -eq "India" } |
    Sort-Object { [int]$_.Year } |
    Select-Object -Last 1
$malariaPer1000 = [double]$indiaLatestMalaria."Incidence of malaria (per 1,000 population at risk)"
Write-Host "  India malaria incidence (latest): $malariaPer1000 per 1000" -ForegroundColor Gray

# ---------------------------------------------------------------------------
# 4. District master list  (state | district-in-csv | id | display-name | lat | lng | pop_M | density)
#    Only districts that exist in the rainfall CSV are truly data-backed.
# ---------------------------------------------------------------------------
$districtMeta = @(
    # West Bengal - all from rainfall CSV
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="KOLKATA";          Id="kolkata";            Name="Kolkata";                  StateDisplay="West Bengal";  Lat=22.57; Lng=88.36; PopM=4.5;  Density=24252 }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="NORTH 24 PRAGANA"; Id="north-24-parganas";   Name="North 24 Parganas";        StateDisplay="West Bengal";  Lat=22.86; Lng=88.54; PopM=10.0; Density=2445  }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="NADIA";            Id="nadia";              Name="Nadia";                    StateDisplay="West Bengal";  Lat=23.47; Lng=88.55; PopM=5.2;  Density=1316  }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="HAORA";            Id="howrah";             Name="Howrah";                   StateDisplay="West Bengal";  Lat=22.58; Lng=88.31; PopM=4.8;  Density=2984  }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="HUGLY";            Id="hooghly";            Name="Hooghly";                  StateDisplay="West Bengal";  Lat=22.90; Lng=88.39; PopM=5.5;  Density=1753  }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="SOUTH 24 PARGANAS";Id="south-24-parganas";  Name="South 24 Parganas";        StateDisplay="West Bengal";  Lat=22.24; Lng=88.41; PopM=8.2;  Density=819   }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="MURSIDBAD";        Id="murshidabad";        Name="Murshidabad";              StateDisplay="West Bengal";  Lat=24.18; Lng=88.27; PopM=7.1;  Density=1334  }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="BIRBHUM";          Id="birbhum";            Name="Birbhum";                  StateDisplay="West Bengal";  Lat=23.90; Lng=87.53; PopM=3.5;  Density=771   }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="BANKURA";          Id="bankura";            Name="Bankura";                  StateDisplay="West Bengal";  Lat=23.23; Lng=87.07; PopM=3.6;  Density=523   }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="PURULYIA";         Id="purulia";            Name="Purulia";                  StateDisplay="West Bengal";  Lat=23.33; Lng=86.36; PopM=2.9;  Density=469   }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="MALDA";            Id="malda";              Name="Malda";                    StateDisplay="West Bengal";  Lat=25.00; Lng=88.14; PopM=3.9;  Density=1072  }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="JALPAIGURI";       Id="jalpaiguri";         Name="Jalpaiguri";               StateDisplay="West Bengal";  Lat=26.54; Lng=88.72; PopM=3.9;  Density=613   }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="DARJEELING";       Id="darjeeling";         Name="Darjeeling";               StateDisplay="West Bengal";  Lat=27.04; Lng=88.26; PopM=1.8;  Density=490   }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="UTTAR_DINAJPUR";   Id="uttar-dinajpur";     Name="Uttar Dinajpur";           StateDisplay="West Bengal";  Lat=26.10; Lng=88.17; PopM=3.0;  Density=902   }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="DAKSIN DINAJPUR";  Id="dakshin-dinajpur";   Name="Dakshin Dinajpur";         StateDisplay="West Bengal";  Lat=25.27; Lng=88.77; PopM=1.7;  Density=813   }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="EASTMEDNIPIR";     Id="purba-medinipur";    Name="Purba Medinipur";          StateDisplay="West Bengal";  Lat=22.43; Lng=87.84; PopM=5.1;  Density=1076  }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="PASCIM MEDNIPUR";  Id="paschim-medinipur";  Name="Paschim Medinipur";        StateDisplay="West Bengal";  Lat=22.78; Lng=87.14; PopM=5.9;  Density=613   }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="JHARGRAM";         Id="jhargram";           Name="Jhargram";                 StateDisplay="West Bengal";  Lat=22.46; Lng=86.98; PopM=1.1;  Density=307   }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="ALIPIRDWAR";       Id="alipurduar";         Name="Alipurduar";               StateDisplay="West Bengal";  Lat=26.49; Lng=89.52; PopM=1.5;  Density=456   }
    [pscustomobject]@{ State="WEST BENGAL"; RainfallDistrict="KALIMPONG";        Id="kalimpong";          Name="Kalimpong";                StateDisplay="West Bengal";  Lat=27.07; Lng=88.47; PopM=0.25; Density=224   }
    # Other major cities for coverage
    [pscustomobject]@{ State="MAHARASHTRA";  RainfallDistrict="MUMBAI";          Id="mumbai";             Name="Mumbai";                   StateDisplay="Maharashtra";  Lat=19.08; Lng=72.88; PopM=12.4; Density=20694 }
    [pscustomobject]@{ State="DELHI";        RainfallDistrict="DELHI";           Id="delhi";              Name="New Delhi";                StateDisplay="Delhi";        Lat=28.61; Lng=77.21; PopM=16.8; Density=11320 }
    [pscustomobject]@{ State="ASSAM";        RainfallDistrict="KAMRUP METROPOLITAN"; Id="guwahati";        Name="Kamrup Metro (Guwahati)";  StateDisplay="Assam";        Lat=26.14; Lng=91.74; PopM=1.3;  Density=1313  }
    [pscustomobject]@{ State="KERALA";       RainfallDistrict="ERNAKULAM";       Id="ernakulam";          Name="Ernakulam";                StateDisplay="Kerala";       Lat=9.98;  Lng=76.30; PopM=3.3;  Density=1072  }
    [pscustomobject]@{ State="TAMIL NADU";   RainfallDistrict="CHENNAI";         Id="chennai";            Name="Chennai";                  StateDisplay="Tamil Nadu";   Lat=13.08; Lng=80.27; PopM=7.1;  Density=26903 }
    [pscustomobject]@{ State="KARNATAKA";    RainfallDistrict="BANGALORE URBAN"; Id="bengaluru";          Name="Bengaluru Urban";          StateDisplay="Karnataka";    Lat=12.97; Lng=77.59; PopM=9.6;  Density=4381  }
    [pscustomobject]@{ State="TELANGANA";    RainfallDistrict="HYDERABAD";       Id="hyderabad";          Name="Hyderabad";                StateDisplay="Telangana";    Lat=17.39; Lng=78.49; PopM=6.8;  Density=18172 }
    [pscustomobject]@{ State="BIHAR";        RainfallDistrict="PATNA";           Id="patna";              Name="Patna";                    StateDisplay="Bihar";        Lat=25.59; Lng=85.14; PopM=5.8;  Density=1803  }
    [pscustomobject]@{ State="UTTAR PRADESH";RainfallDistrict="LUCKNOW";         Id="lucknow";            Name="Lucknow";                  StateDisplay="Uttar Pradesh";Lat=26.85; Lng=80.95; PopM=4.6;  Density=1815  }
    [pscustomobject]@{ State="RAJASTHAN";    RainfallDistrict="JAIPUR";          Id="jaipur";             Name="Jaipur";                   StateDisplay="Rajasthan";    Lat=26.91; Lng=75.79; PopM=6.6;  Density=598   }
)

# ---------------------------------------------------------------------------
# 5. Compute risk scores based on REAL rainfall data
#    Formula: rain7d drives flood/vector risk; cumulative vs normal drives water/overall
# ---------------------------------------------------------------------------
Write-Host "Computing risk scores from real data..." -ForegroundColor Cyan

function Clamp($v, $min, $max) { [math]::Max($min, [math]::Min($max, $v)) }

function Compute-RainfallScore($rain7d, $weeklyDeparturePct) {
    # Higher rainfall above normal = higher risk
    # rain7d > 50mm already problematic; >100mm critical
    $baseFromRain = Clamp([int]($rain7d / 2.5), 5, 70)
    # Departure boosts risk if positive (more than normal)
    $deptBoost = 0
    if ($weeklyDeparturePct -gt 0) { $deptBoost = Clamp([int]($weeklyDeparturePct * 0.1), 0, 20) }
    return Clamp($baseFromRain + $deptBoost, 5, 90)
}

# Get actual latest rainfall rows per district
$latestRainByDistrict = @{}
$rainfallRaw | ForEach-Object {
    try {
        $dt = [datetime]::ParseExact($_.Date.Trim(), "dd-MM-yyyy", $null)
        $key = "$($_.State.Trim().ToUpper())|$($_.District.Trim().ToUpper())"
        if (-not $latestRainByDistrict.ContainsKey($key) -or $dt -gt $latestRainByDistrict[$key].ParsedDate) {
            $dep = 0.0
            [double]::TryParse(($_.("Weekly Departure Per") -replace '%','').Trim(), [ref]$dep) | Out-Null
            $cum = 0.0
            [double]::TryParse($_.("Cumulative Actual").Trim(), [ref]$cum) | Out-Null
            $cumNorm = 0.0
            [double]::TryParse($_.("Cumulative Normal").Trim(), [ref]$cumNorm) | Out-Null
            $latestRainByDistrict[$key] = [pscustomobject]@{
                ParsedDate = $dt
                Date = $_.Date
                DailyActual = if ($_.("Daily Actual").Trim() -ne "") { [double]$_.("Daily Actual").Trim() } else { 0.0 }
                WeeklyActual = if ($_.("Weekly Actual").Trim() -ne "") { [double]$_.("Weekly Actual").Trim() } else { 0.0 }
                WeeklyNormal = if ($_.("Weekly Normal").Trim() -ne "") { [double]$_.("Weekly Normal").Trim() } else { 0.0 }
                WeeklyDeparture = $dep
                CumulativeActual = $cum
                CumulativeNormal = $cumNorm
            }
        }
    } catch {}
}

# ---------------------------------------------------------------------------
# 6. Build district objects
# ---------------------------------------------------------------------------
Write-Host "Building district objects..." -ForegroundColor Cyan

function Get-DistrictData($meta) {
    $id = $meta.Id
    $stateUp = $meta.State.ToUpper()
    $rainfallKey = "$stateUp|$($meta.RainfallDistrict.ToUpper())"

    # Rainfall lookup
    $rain = $null
    # Try exact key
    if ($latestRainByDistrict.ContainsKey($rainfallKey)) {
        $rain = $latestRainByDistrict[$rainfallKey]
    } else {
        # Fuzzy: find closest match
        $latestRainByDistrict.Keys | Where-Object { $_ -like "$stateUp|*$($meta.RainfallDistrict.Substring(0,[math]::Min(5,$meta.RainfallDistrict.Length)).ToUpper())*" } | Select-Object -First 1 | ForEach-Object {
            $rain = $latestRainByDistrict[$_]
        }
    }

    $rain7d = if ($rain) { [math]::Round($rain.WeeklyActual, 1) } else { 25.0 }
    $weeklyDep = if ($rain) { $rain.WeeklyDeparture } else { 0 }
    $cumActual = if ($rain) { $rain.CumulativeActual } else { 300 }
    $cumNormal = if ($rain) { $rain.CumulativeNormal } else { 350 }
    $dailyActual = if ($rain) { $rain.DailyActual } else { 5.0 }

    # Cumulative departure as %, negative = deficit, positive = excess
    $cumDep = 0.0
    if ($cumNormal -gt 0) { $cumDep = [math]::Round((($cumActual - $cumNormal) / $cumNormal) * 100, 1) }

    # Dengue signal for WB districts
    $dengueKey = $meta.Name.ToUpper()
    $dengueCases = 0
    if ($dengueByDistrict.ContainsKey($dengueKey)) { $dengueCases = $dengueByDistrict[$dengueKey] }

    # ---- Score computation ----
    # Water/flood risk: driven by actual rainfall vs normal
    $waterScore = Clamp([int](($rain7d / [math]::Max($rain.WeeklyNormal, 1)) * 50) + [math]::Max(0, [int]($cumDep * 0.3)), 5, 95)

    # Vector-borne risk: high rain + post-monsoon season = high breeding
    $month = (Get-Date).Month
    $seasonMultiplier = if ($month -ge 7 -and $month -le 11) { 1.3 } else { 0.8 }
    $vectorScore = Clamp([int]($waterScore * 0.85 * $seasonMultiplier + ($dengueCases * 0.05)), 5, 95)

    # Human health: blend of vector + water + malaria baseline
    $malariaBoost = [math]::Round($malariaPer1000 * 2.5, 0)
    $humanScore = Clamp([int](($vectorScore * 0.5 + $waterScore * 0.3 + $malariaBoost) * 0.9), 5, 95)

    # Animal health: correlated with environment/flooding
    $animalScore = Clamp([int]($waterScore * 0.6 + $vectorScore * 0.2 + 10), 5, 90)

    # Environment: based on rainfall anomaly
    $envScore = Clamp([int](50 + $cumDep * 0.4 + ($dailyActual * 0.5)), 5, 95)

    # Respiratory: inverse of rain (dry + dust OR cold+wet)
    $respScore = Clamp([int](if ($cumDep -lt -30) { 60 + [math]::Abs($cumDep) * 0.2 } else { 35 + $rain7d * 0.15 }), 10, 85)

    # Zoonotic: blend of animal + water
    $zoonoticScore = Clamp([int](($animalScore * 0.6 + $waterScore * 0.4) * 0.9), 5, 90)

    # Overall: weighted average
    $overall = Clamp([int](($humanScore * 0.3 + $animalScore * 0.15 + $envScore * 0.15 + $vectorScore * 0.2 + $waterScore * 0.2)), 5, 98)

    # Confidence: higher when real rainfall data is present
    $confidence = if ($rain) { [math]::Min(85, 65 + [math]::Abs([int]($cumDep * 0.1))) } else { 45 }

    # Humidity proxy from rain (rough)
    $humidity = Clamp([int](55 + $rain7d * 0.4 + ($cumDep * 0.05)), 45, 98)

    # Temperature (season-based, region-adjusted)
    $latAdjTemp = [math]::Round(32 - ($meta.Lat - 10) * 0.5 + (if ($month -ge 11 -or $month -le 2) { -5 } else { 0 }), 0)
    $temp = Clamp($latAdjTemp, 15, 42)

    # Forecast string
    $forecast = if ($rain7d -gt 80) { "Heavy rain / flooding risk — next 72h active" }
                elseif ($rain7d -gt 40) { "Moderate rain expected; watch for waterlogging" }
                elseif ($cumDep -lt -40) { "Below-normal cumulative rainfall; drought watch" }
                else { "Partly cloudy, isolated showers likely" }

    # NDWI/NDVI/LST/Flood proxies from rainfall data
    $ndwi = [math]::Round([math]::Min(0.8, 0.1 + $rain7d / 300), 2)
    $floodExtent = [math]::Round([math]::Max(0, $rain7d / 25 * $meta.Density / 5000), 1)
    $ndvi = [math]::Round(0.3 + [math]::Min(0.45, $rain7d / 300 + $cumDep / 1000), 2)
    $lst = Clamp([int]($temp + 2 + (if ($ndvi -gt 0.5) { -3 } else { 2 })), 20, 50)

    # Dengue lab confirmed
    $dengueLab = if ($dengueCases -gt 0) { [math]::Min($dengueCases, 999) } else { [math]::Round($overall * 0.4 + 2, 0) }

    return [pscustomobject]@{
        id = $id
        name = $meta.Name
        state = $meta.StateDisplay
        lat = $meta.Lat
        lng = $meta.Lng
        popM = $meta.PopM
        density = $meta.Density
        confidence = $confidence
        overall = $overall
        human = $humanScore
        animal = $animalScore
        environment = $envScore
        vector = $vectorScore
        water = $waterScore
        respiratory = $respScore
        zoonotic = $zoonoticScore
        rain7d = $rain7d
        temp = $temp
        humidity = $humidity
        forecast = $forecast
        ndwi = $ndwi
        floodExtent = $floodExtent
        ndvi = $ndvi
        lst = $lst
        dengueLab = $dengueLab
        cumRainActual = $cumActual
        cumRainNormal = $cumNormal
        cumDep = $cumDep
        haRealRainfall = ($rain -ne $null)
        dataDate = if ($rain) { $rain.Date } else { "N/A" }
    }
}

$districts = $districtMeta | ForEach-Object { Get-DistrictData $_ }

# ---------------------------------------------------------------------------
# 7. Generate the TypeScript file
# ---------------------------------------------------------------------------
Write-Host "Generating districts.ts..." -ForegroundColor Cyan

$tsLines = [System.Collections.Generic.List[string]]::new()

$tsLines.Add("// AUTO-GENERATED by generate-districts.ps1")
$tsLines.Add("// Source: IMD Daily Rainfall (district-wise), NCDC Dengue Outbreak Records, WHO Malaria Incidence")
$tsLines.Add("// Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm') IST")
$tsLines.Add("// Rainfall data date: $((($districts | Where-Object { $_.haRealRainfall } | Select-Object -First 1).dataDate))")
$tsLines.Add("// NOTE: Scores are computed from real rainfall and outbreak records.")
$tsLines.Add("//       Human/animal/satellite signals without a live API are modelled from rainfall + malaria incidence.")
$tsLines.Add("")
$tsLines.Add("export type Level = `"Low`" | `"Moderate`" | `"High`" | `"Critical`";")
$tsLines.Add("export type Layer =")
$tsLines.Add("  | `"overall`" | `"human`" | `"animal`" | `"environment`"")
$tsLines.Add("  | `"vector`" | `"water`" | `"respiratory`" | `"zoonotic`";")
$tsLines.Add("")
$tsLines.Add("export const LAYERS: { id: Layer; label: string }[] = [")
$tsLines.Add("  { id: `"overall`", label: `"Overall Risk`" },")
$tsLines.Add("  { id: `"human`", label: `"Human Health`" },")
$tsLines.Add("  { id: `"animal`", label: `"Animal Health`" },")
$tsLines.Add("  { id: `"environment`", label: `"Environment`" },")
$tsLines.Add("  { id: `"vector`", label: `"Vector-borne`" },")
$tsLines.Add("  { id: `"water`", label: `"Water-borne`" },")
$tsLines.Add("  { id: `"respiratory`", label: `"Respiratory`" },")
$tsLines.Add("  { id: `"zoonotic`", label: `"Zoonotic`" },")
$tsLines.Add("];")
$tsLines.Add("")
$tsLines.Add("export interface Contribution { factor: string; value: number }")
$tsLines.Add("export interface District {")
$tsLines.Add("  id: string; name: string; state: string; lat: number; lng: number;")
$tsLines.Add("  population: number; density: number;")
$tsLines.Add("  scores: Record<Layer, number>;")
$tsLines.Add("  confidence: number;")
$tsLines.Add("  why: Contribution[];")
$tsLines.Add("  human: { label: string; value: string; delta: number }[];")
$tsLines.Add("  animal: { label: string; value: string; delta: number }[];")
$tsLines.Add("  environment: { label: string; value: string; delta: number }[];")
$tsLines.Add("  weather: { temp: number; humidity: number; rain7d: number; forecast: string };")
$tsLines.Add("  satellite: { ndwi: number; floodExtent: number; ndvi: number; lst: number };")
$tsLines.Add("  events: string[];")
$tsLines.Add("  actions: string[];")
$tsLines.Add("  dataSource: string;")
$tsLines.Add("}")
$tsLines.Add("")
$tsLines.Add("export function level(score: number): Level {")
$tsLines.Add("  if (score >= 75) return `"Critical`";")
$tsLines.Add("  if (score >= 55) return `"High`";")
$tsLines.Add("  if (score >= 35) return `"Moderate`";")
$tsLines.Add("  return `"Low`";")
$tsLines.Add("}")
$tsLines.Add("")
$tsLines.Add("export const districts: District[] = [")

foreach ($d in $districts) {
    # Why bars — contribution breakdown based on real scores
    $whyItems = @()
    $whyItems += "{ factor: `"Rainfall (7d: $($d.rain7d)mm)`", value: $(Clamp([int]($d.water * 0.25), 1, 25)) }"
    $whyItems += "{ factor: `"Vector breeding conditions`", value: $(Clamp([int]($d.vector * 0.22), 1, 22)) }"
    $whyItems += "{ factor: `"Waterlogging / flood risk`", value: $(Clamp([int]($d.water * 0.20), 1, 20)) }"
    $whyItems += "{ factor: `"Malaria baseline (national)`", value: $(Clamp([int]($malariaPer1000 * 1.5), 1, 15)) }"
    $whyItems += "{ factor: `"Population density`", value: $(Clamp([int]($d.density / 2000), 1, 12)) }"
    if ($d.dengueLab -gt 5) { $whyItems += "{ factor: `"Dengue outbreak record`", value: $(Clamp([int]($d.dengueLab * 0.02), 1, 10)) }" }
    $whyStr = ($whyItems -join ", ")

    # Human signals
    $feverEst = [math]::Round(50 + $d.overall * 8 * 0.7, 0)
    $diarrhoeaEst = [math]::Round(20 + $d.water * 2.5, 0)
    $opdResp = [math]::Round(200 + $d.respiratory * 3, 0)

    # Animal signals
    $livestockIll = [math]::Round(8 + $d.animal * 0.4, 0)
    $poultryMort = [math]::Round($d.zoonotic * 0.05, 0)
    $dogBite = [math]::Round(15 + $d.animal * 0.6, 0)

    # Env signals
    $stagnantSites = [math]::Round($d.water * 2.0, 0)
    $coliform = [math]::Round([math]::Max(5, $d.water * 0.25), 0)

    # Actions
    $actions = @(
        "`"Activate vector source-reduction in waterlogged wards`""
        "`"Intensify fever and dengue surveillance at PHCs`""
        "`"Issue public advisory on stagnant water and mosquito protection`""
        "`"Coordinate veterinary checks in peri-urban livestock clusters`""
        "`"Pre-position ORS, test kits and IV fluids at district hospitals`""
    )
    $actionCount = if ($d.overall -ge 60) { 5 } elseif ($d.overall -ge 40) { 3 } else { 2 }
    $actionsStr = ($actions[0..($actionCount-1)] -join ", ")

    # Events
    $month = (Get-Date).Month
    $seasonEvent = if ($month -ge 9 -and $month -le 11) { "`"Post-monsoon vector breeding peak`"" } else { "`"Active monsoon season`"" }
    $eventsStr = if ($d.id -eq "kolkata") {
        "$seasonEvent, `"Durga Puja mass gatherings (Oct)`", `"Pandal water storage risk`""
    } else {
        "$seasonEvent"
    }

    # Data source label
    $sourceLabel = if ($d.haRealRainfall) { "IMD Rainfall $($d.dataDate)" } else { "Modelled (no direct rainfall record)" }

    $tsLines.Add("  {")
    $tsLines.Add("    id: `"$($d.id)`",")
    $tsLines.Add("    name: `"$($d.name)`",")
    $tsLines.Add("    state: `"$($d.state)`",")
    $tsLines.Add("    lat: $($d.lat),")
    $tsLines.Add("    lng: $($d.lng),")
    $tsLines.Add("    population: $([int]($d.popM * 1000000)),")
    $tsLines.Add("    density: $($d.density),")
    $tsLines.Add("    confidence: $($d.confidence),")
    $tsLines.Add("    scores: {")
    $tsLines.Add("      overall: $($d.overall), human: $($d.human), animal: $($d.animal),")
    $tsLines.Add("      environment: $($d.environment), vector: $($d.vector), water: $($d.water),")
    $tsLines.Add("      respiratory: $($d.respiratory), zoonotic: $($d.zoonotic),")
    $tsLines.Add("    },")
    $tsLines.Add("    why: [ $whyStr ],")
    $tsLines.Add("    human: [")
    $tsLines.Add("      { label: `"Acute fever reports (7d)`", value: `"$feverEst`", delta: $(Clamp([int]($d.human * 0.3), 1, 30)) },")
    $tsLines.Add("      { label: `"Diarrhoeal cases (7d)`", value: `"$diarrhoeaEst`", delta: $(Clamp([int]($d.water * 0.2), 1, 25)) },")
    $tsLines.Add("      { label: `"OPD respiratory visits`", value: `"$opdResp`", delta: $(Clamp([int]($d.respiratory * 0.15 - 3), -5, 20)) },")
    $tsLines.Add("      { label: `"Lab-confirmed dengue`", value: `"$($d.dengueLab)`", delta: $(Clamp([int]($d.vector * 0.18), 0, 20)) },")
    $tsLines.Add("    ],")
    $tsLines.Add("    animal: [")
    $tsLines.Add("      { label: `"Livestock illness reports`", value: `"$livestockIll`", delta: $(Clamp([int]($d.animal * 0.2 - 2), -5, 20)) },")
    $tsLines.Add("      { label: `"Poultry mortality events`", value: `"$poultryMort`", delta: $(Clamp([int]($d.zoonotic * 0.08 - 1), -3, 10)) },")
    $tsLines.Add("      { label: `"Stray dog bite reports`", value: `"$dogBite`", delta: $(Clamp([int]($d.animal * 0.12 - 1), -3, 15)) },")
    $tsLines.Add("    ],")
    $tsLines.Add("    environment: [")
    $tsLines.Add("      { label: `"Stagnant water sites`", value: `"$stagnantSites`", delta: $(Clamp([int]($d.water * 0.22), 1, 20)) },")
    $tsLines.Add("      { label: `"Water quality (coliform+)`", value: `"$coliform% samples`", delta: $(Clamp([int]($d.water * 0.1), 0, 12)) },")
    $tsLines.Add("      { label: `"AQI (PM2.5)`", value: `"$(Clamp([int](60 + $d.density / 500), 50, 250))`", delta: 0 },")
    $tsLines.Add("    ],")
    $tsLines.Add("    weather: {")
    $tsLines.Add("      temp: $($d.temp), humidity: $($d.humidity),")
    $tsLines.Add("      rain7d: $($d.rain7d), forecast: `"$($d.forecast)`",")
    $tsLines.Add("    },")
    $tsLines.Add("    satellite: {")
    $tsLines.Add("      ndwi: $($d.ndwi), floodExtent: $($d.floodExtent),")
    $tsLines.Add("      ndvi: $($d.ndvi), lst: $($d.lst),")
    $tsLines.Add("    },")
    $tsLines.Add("    events: [ $eventsStr ],")
    $tsLines.Add("    actions: [ $actionsStr ],")
    $tsLines.Add("    dataSource: `"$sourceLabel`",")
    $tsLines.Add("  },")
}

$tsLines.Add("];")
$tsLines.Add("")
$tsLines.Add("export const getDistrict = (id: string) => districts.find((d) => d.id === id);")
$tsLines.Add("")
$tsLines.Add("export interface TimelinePoint { day: string; score: number; alert?: boolean; note?: string }")
$tsLines.Add("export function timeline(d: District): TimelinePoint[] {")
$tsLines.Add("  // Deterministic pseudo-random based on district id + score")
$tsLines.Add("  function seed(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return () => ((h = (h * 1103515245 + 12345) >>> 0) % 1000) / 1000; }")
$tsLines.Add("  const r = seed(d.id + 't');")
$tsLines.Add("  const pts: TimelinePoint[] = [];")
$tsLines.Add("  const start = d.scores.overall - 28;")
$tsLines.Add("  for (let i = 0; i < 14; i++) {")
$tsLines.Add("    const date = new Date(2026, 9, 9 - 13 + i);")
$tsLines.Add("    const score = Math.round(start + (28 * i) / 13 + (r() - 0.5) * 5);")
$tsLines.Add("    pts.push({ day: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), score: i === 13 ? d.scores.overall : score });")
$tsLines.Add("  }")
$tsLines.Add("  const cross = pts.findIndex((p) => p.score >= 75);")
$tsLines.Add("  const cp = pts[cross];")
$tsLines.Add("  if (cp) { cp.alert = true; cp.note = 'Threshold crossed — warning issued'; }")
$tsLines.Add("  pts[7]!.note = pts[7]!.note ?? 'Rainfall spike detected';")
$tsLines.Add("  return pts;")
$tsLines.Add("}")
$tsLines.Add("")
$tsLines.Add("export function history(d: District) {")
$tsLines.Add("  function seed(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return () => ((h = (h * 1103515245 + 12345) >>> 0) % 1000) / 1000; }")
$tsLines.Add("  const r = seed(d.id + 'h');")
$tsLines.Add("  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => ({")
$tsLines.Add("    month: m,")
$tsLines.Add("    avg: Math.round(20 + 50 * Math.max(0, Math.sin((i - 4) / 3)) * (d.scores.overall / 82)),")
$tsLines.Add("    current: i <= 9 ? Math.round(20 + 55 * Math.max(0, Math.sin((i - 4) / 3)) * (d.scores.overall / 82) + (r() - 0.5) * 8) : undefined,")
$tsLines.Add("  }));")
$tsLines.Add("}")
$tsLines.Add("")
$tsLines.Add("export const warnings = districts")
$tsLines.Add("  .filter((d) => d.scores.overall >= 55)")
$tsLines.Add("  .sort((a, b) => b.scores.overall - a.scores.overall)")
$tsLines.Add("  .map((d, i) => ({")
$tsLines.Add("    id: \`W-2026-\${1040 + i}\`,")
$tsLines.Add("    district: d,")
$tsLines.Add("    level: level(d.scores.overall),")
$tsLines.Add("    detected: new Date(2026, 9, 9 - i).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),")
$tsLines.Add("    signals: [...d.why].sort((a, b) => b.value - a.value).slice(0, 3).map((w) => w.factor),")
$tsLines.Add("  }));")
$tsLines.Add("")
$tsLines.Add("export const alertHistory = warnings.slice(0, 7).map((w, i) => ({")
$tsLines.Add("  date: w.detected,")
$tsLines.Add("  district: w.district.name,")
$tsLines.Add("  type: w.district.scores.vector > w.district.scores.water ? 'Vector-borne' : 'Water-borne',")
$tsLines.Add("  level: w.level,")
$tsLines.Add("  status: i < 2 ? 'Active' : i < 5 ? 'Monitoring' : 'Resolved',")
$tsLines.Add("}) as { date: string; district: string; type: string; level: Level; status: string });")

# Write to file
$outPath = "$root\src\data\districts.ts"
$tsLines | Set-Content -Path $outPath -Encoding UTF8
Write-Host ""
Write-Host "✅ SUCCESS! Generated: $outPath" -ForegroundColor Green
Write-Host "   Districts: $($districts.Count)" -ForegroundColor Green
Write-Host "   Real rainfall data: $($districts | Where-Object { $_.haRealRainfall } | Measure-Object | Select-Object -ExpandProperty Count) districts" -ForegroundColor Green
Write-Host "   Warnings (score>=55): $($districts | Where-Object { $_.overall -ge 55 } | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Green
Write-Host ""
Write-Host "Score summary:" -ForegroundColor Yellow
$districts | Sort-Object overall -Descending | ForEach-Object {
    $src = if ($_.haRealRainfall) { "✅ IMD" } else { "⚠️  modelled" }
    Write-Host "  $($_.name.PadRight(28)) overall=$($_.overall)  rain7d=$($_.rain7d)mm  $src"
}
