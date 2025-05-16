import {Label} from "@/components/ui/label"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

interface Props {
    selected: string

    setSelected(selected: string): void
}

const StyledRadioButton = (props: Props) => {
    return (
        <RadioGroup value={props.selected} onValueChange={props.setSelected} defaultValue="1"
                    className={'flex items-center justify-start w-full gap-x-4'}>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="1"/>
                <Label htmlFor="1">1 Day</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="3"/>
                <Label htmlFor="3">3 Days</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="7" id="7"/>
                <Label htmlFor="7">7 Days</Label>
            </div>
        </RadioGroup>

    )
}

export default StyledRadioButton
