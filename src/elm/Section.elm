module Section exposing (..)

import Html exposing (..)
import ClientRegister
import Invoices


-- MODEL

type Model
  = ClientRegisterModel ClientRegister.Model
  | InvoicesModel Invoices.Model

type Msg
  = ClientRegisterMsg ClientRegister.Msg
  | InvoicesMsg Invoices.Msg

type alias Section =
  { model: (Model, Cmd Msg)
  , update: Msg -> Model -> (Model, Cmd Msg) 
  , view: Model -> Html Msg
  }

init : Model
init =
  Section
    (ClientRegister.initModel, Cmd ClientRegisterMsg ClientRegister.initMsg)
    ClientRegister.update
    ClientRegister.view

