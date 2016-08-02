module Invoices exposing (..)
 
import Html exposing (..)
--import Html.Attributes exposing (..)


-- MODEL

type alias Model =
  { name: String
  }

type Msg
  = SomeMsg
  | OtherMsg

initModel : Model
initModel =
  Model "Invoices"

initMsg : Msg
initMsg =
  SomeMsg


-- UPDATE

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  (model, Cmd.none)


-- VIEW

view : Model -> Html Msg
view model =
  div []
    [ text "invoices" ]


-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none
