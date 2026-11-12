param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
)
python "$PSScriptRoot\scripts\switch_model.py" $Args


