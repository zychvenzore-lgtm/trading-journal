//+------------------------------------------------------------------+
//|                                              TradeVaultSync.mq5 |
//|                                       Copyright 2026, TradeVault |
//|                                             https://tradevault.com|
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, TradeVault"
#property link      "https://tradevault.com"
#property version   "1.00"

input string WebhookURL = "http://localhost:3000/api/webhooks/mt5"; // Your Journal Webhook URL
input string SyncToken = ""; // Your Account ID (Token)

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
   Print("TradeVault Sync EA Initialized. Token: ", SyncToken);
   if(SyncToken == "") {
      Print("WARNING: SyncToken (Account ID) is empty. Webhook will fail.");
   }
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
//| TradeTransaction function                                        |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
  {
   // We are only interested in DEALs being added to history
   if(trans.type == TRADE_TRANSACTION_HISTORY_ADD)
     {
      // Check if it's a Deal
      if(HistoryDealSelect(trans.deal))
        {
         long deal_entry = HistoryDealGetInteger(trans.deal, DEAL_ENTRY);
         // We only want OUT deals (when a position is closed)
         if(deal_entry == DEAL_ENTRY_OUT || deal_entry == DEAL_ENTRY_OUT_BY)
           {
            SendTradeToWebhook(trans.deal);
           }
        }
     }
  }

//+------------------------------------------------------------------+
//| SendTradeToWebhook                                               |
//+------------------------------------------------------------------+
void SendTradeToWebhook(ulong deal_ticket)
  {
   string symbol = HistoryDealGetString(deal_ticket, DEAL_SYMBOL);
   long type = HistoryDealGetInteger(deal_ticket, DEAL_TYPE);
   double exit_price = HistoryDealGetDouble(deal_ticket, DEAL_PRICE);
   double volume = HistoryDealGetDouble(deal_ticket, DEAL_VOLUME);
   double profit = HistoryDealGetDouble(deal_ticket, DEAL_PROFIT);
   double commission = HistoryDealGetDouble(deal_ticket, DEAL_COMMISSION);
   double swap = HistoryDealGetDouble(deal_ticket, DEAL_SWAP);
   long close_time_ms = HistoryDealGetInteger(deal_ticket, DEAL_TIME_MSC);
   
   // A closed deal type is usually the OPPOSITE of the position direction
   // E.g. A Buy position is closed by a DEAL_TYPE_SELL
   string direction = "LONG";
   if(type == DEAL_TYPE_BUY) direction = "SHORT"; // Closed by buy = was a short
   
   // To find the entry price and time, we need to find the matching IN deal for the same POSITION_ID
   long position_id = HistoryDealGetInteger(deal_ticket, DEAL_POSITION_ID);
   
   double entry_price = 0.0;
   long entry_time_ms = 0;
   
   HistorySelectByPosition(position_id);
   int total_deals = HistoryDealsTotal();
   for(int i=0; i<total_deals; i++)
     {
      ulong ticket = HistoryDealGetTicket(i);
      long d_entry = HistoryDealGetInteger(ticket, DEAL_ENTRY);
      if(d_entry == DEAL_ENTRY_IN)
        {
         entry_price = HistoryDealGetDouble(ticket, DEAL_PRICE);
         entry_time_ms = HistoryDealGetInteger(ticket, DEAL_TIME_MSC);
         break;
        }
     }
     
   // Format timestamps to ISO strings approx (YYYY-MM-DDTHH:mm:ss.000Z)
   string entry_time_str = TimeToString((datetime)(entry_time_ms/1000), TIME_DATE|TIME_MINUTES|TIME_SECONDS);
   string close_time_str = TimeToString((datetime)(close_time_ms/1000), TIME_DATE|TIME_MINUTES|TIME_SECONDS);
   
   // Replace spaces with 'T' and add 'Z' to make it loosely ISO 8601 for the JS backend
   StringReplace(entry_time_str, " ", "T");
   entry_time_str = entry_time_str + "Z";
   StringReplace(close_time_str, " ", "T");
   close_time_str = close_time_str + "Z";
   
   // Replace '.' with '-' in date part for true ISO
   StringReplace(entry_time_str, ".", "-");
   StringReplace(close_time_str, ".", "-");

   // Construct JSON Payload
   string json = "{";
   json += "\"token\":\"" + SyncToken + "\",";
   json += "\"ticker\":\"" + symbol + "\",";
   json += "\"direction\":\"" + direction + "\",";
   json += "\"entry_price\":" + DoubleToString(entry_price, 5) + ",";
   json += "\"exit_price\":" + DoubleToString(exit_price, 5) + ",";
   json += "\"position_size\":" + DoubleToString(volume, 2) + ",";
   json += "\"profit\":" + DoubleToString(profit, 2) + ",";
   json += "\"commission\":" + DoubleToString(commission, 2) + ",";
   json += "\"swap\":" + DoubleToString(swap, 2) + ",";
   json += "\"entry_time\":\"" + entry_time_str + "\",";
   json += "\"close_time\":\"" + close_time_str + "\"";
   json += "}";

   // WebRequest
   char post[], result[];
   string headers = "Content-Type: application/json\r\n";
   StringToCharArray(json, post, 0, WHOLE_ARRAY, CP_UTF8);
   
   // Remove the null terminator added by StringToCharArray for binary data
   int post_len = ArraySize(post) - 1;
   
   string result_headers;
   int res = WebRequest("POST", WebhookURL, headers, 5000, post, result, result_headers);
   
   if(res == 200)
     {
      Print("Trade synced successfully: ", symbol, " Profit: ", profit);
     }
   else
     {
      Print("Failed to sync trade. Error: ", GetLastError(), " HTTP Code: ", res);
      Print("Response: ", CharArrayToString(result));
     }
  }
