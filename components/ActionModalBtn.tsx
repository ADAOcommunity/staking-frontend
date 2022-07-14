import { useState } from "react";
import UseAnimations from 'react-useanimations';
import alertTriangle from 'react-useanimations/lib/alertTriangle'
import loading from 'react-useanimations/lib/loading'
import success from 'react-useanimations/lib/checkmark'

type ActionState = "loading" | "success" | "error" | undefined
export default function StakeModalBtn({ actionName, enabled, contractAddress, action }: { actionName: string, contractAddress: string, enabled: boolean, action: () => Promise<any> }) {
    const [state, setState] = useState<ActionState>('loading')
    const [msg, setMsg] = useState("Waiting...")

    const doAction = async (action: () => Promise<any>) => {
        try{
            const res = await action()
            setMsg("")
            setState('success')
            setMsg(`Submitted: ${res}`)
        } catch(err: any) {
            setMsg("")
            setState('error')
            setMsg(`Error: ${err.info || err.message || err.error || err ? typeof err === "object" ? JSON.stringify(err) != "" ?
            JSON.stringify(err) :
            'Your tokens are safe, in order to accomplish your action, please come back in five minutes and try again. If the issue persists, please reach out to ADAO in the discord.' :
            'Your tokens are safe, in order to accomplish your action, please come back in five minutes and try again. If the issue persists, please reach out to ADAO in the discord.' :
            'Your tokens are safe, in order to accomplish your action, please come back in five minutes and try again. If the issue persists, please reach out to ADAO in the discord.'}`
        )
        }
    }
    
    return (
        <>
            {enabled ? 
                <label htmlFor={`${contractAddress}-${actionName}-modal`} className="btn btn-sm mr-1 modal-button">{actionName}</label> :
                <button disabled className="btn btn-sm mr-1 modal-button">{actionName}</button>
            }
            <input
                type="checkbox"
                id={`${contractAddress}-${actionName}-modal`}
                onChange={(e) => {
                    if(e.target.checked){
                        setMsg("")
                        setState("loading")
                        setMsg("Waiting...")
                        doAction(action)
                    } else {
                        setMsg("")
                        setState(undefined)
                    }
                    
                }}
                className="modal-toggle"
            />
            <label htmlFor={`${contractAddress}-${actionName}-modal`} className="modal cursor-pointer">
                <label className="modal-box relative flex flex-col bg-neutral text-neutral-content bg-opacity-95 max-w-4xl" htmlFor="">
                    {msg ? 
                        <> 
                            <UseAnimations
                                className="mx-auto"
                                strokeColor="currentColor"
                                size={128}
                                animation={
                                    state === 'error' ?
                                        alertTriangle : state === 'success' ?
                                            success : loading
                                    }
                            />
                            <h3 className="text-lg font-bold mx-auto">{msg}</h3>
                        </>
                        :
                        <button className="btn btn-outline text-neutral-content ml-auto max-w-xs">
                            Cancel
                        </button>
                    }
                </label>
            </label>
        </>
    )
}
