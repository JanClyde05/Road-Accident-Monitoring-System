param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
)
python "$PSScriptRoot\scripts\openrouter_glm.py" --pcb $Args


