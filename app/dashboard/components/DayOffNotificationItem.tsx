import {DayOffType} from "@/utilities/enum";

export interface DayInformationProps {
    date: string
    weekDayName: string
    type: DayOffType.WorkingDay | DayOffType.DayOff
    description: string
}

const DayOffNotificationItem = (props: DayInformationProps) => {
    const {date, weekDayName, description, type = 0} = props
    return (
        <div
            className={`flex flex-col gap-y-3 w-full py-2 px-3 ${type == DayOffType.WorkingDay ? "bg-[#C0CAF1]" : 'bg-[#FFDADA]'}`}>
            <div className={'flex flex-row w-full gap-x-3 items-center'}>
                <p className={'text-[16px]'}>{date}</p>
                <p className={'text-[16px]'}>{weekDayName}</p>
                <p className={'text-[16px]'}>{type == DayOffType.DayOff ? 'Day Off' : "Work Day"}</p>
            </div>
            <div className={"flex items-start"}>
                <p className={'text-[16px] text-left whitespace-pre-wrap'}>{description}</p>
            </div>
        </div>

    )
}

export default DayOffNotificationItem
