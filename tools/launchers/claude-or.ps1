param(
    [Parameter(Position = 0)]
    [string]$ModelOrArg,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$RemainingArgs
)

if ($ModelOrArg -in @("glm", "qwen", "gemma", "gemma-free")) {
    & "$PSScriptRoot\switch_model.ps1" $ModelOrArg
    claude $RemainingArgs
} else {
    $all = @()
    if ($ModelOrArg) { $all += $ModelOrArg }
    if ($RemainingArgs) { $all += $RemainingArgs }
    claude $all
}


